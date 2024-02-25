"use server";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BUIILDER_FI_V1_EVENT_SIGNATURE, BUILDERFI_CONTRACT, IN_USE_CHAIN_ID, PAGINATION_LIMIT } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { formatBigIntToFixedDecimals } from "@/lib/utils";
import viemClient from "@/lib/viemClient";
import { NotificationType } from "@prisma/client";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { decodeEventLog, parseAbiItem } from "viem";
import { publishNewTradeKeysCast, publishNewUserCast } from "../farcaster/farcaster";
import { sendNotification } from "../notification/notification";

const logsRange = process.env.LOGS_RANGE_SIZE ? BigInt(process.env.LOGS_RANGE_SIZE) : 100n;

interface EventLog {
  eventName: "Trade";
  args: {
    trader: `0x${string}`;
    builder: `0x${string}`;
    isBuy: boolean;
    shareAmount: bigint;
    ethAmount: bigint;
    protocolEthAmount: bigint;
    builderEthAmount: bigint;
    supply: bigint;
    nextPrice: bigint;
  };
}

const storeTransactionInternal = async (log: EventLog, hash: string, blockNumber: bigint, timestamp: bigint) => {
  //Check if transaction already exists in DB
  let transaction = await prisma.trade.findFirst({
    where: {
      hash: hash
    }
  });

  //If transaction has been processed, we don't need to update keyRelationship
  if (transaction && transaction.processed) {
    console.log("Transaction already processed");
    return null;
  }

  // Transactions can be about a new key or an existing key

  // if the amount is 0, it's a new key (the first key is bought for free by the builder)
  const isNewKey = Number(log.args.ethAmount) == 0 && log.args.trader.toLowerCase() === log.args.builder.toLowerCase();

  // if the amount is not 0, it's an existing key
  const existingKey =
    Number(log.args.ethAmount) != 0 && log.args.trader.toLowerCase() !== log.args.builder.toLowerCase();

  //If transaction doesn't exist, we create it
  if (!transaction) {
    transaction = await prisma.trade.create({
      data: {
        hash: hash,
        chainId: IN_USE_CHAIN_ID,
        amount: log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount,
        ethCost: log.args.ethAmount,
        protocolFee: log.args.protocolEthAmount,
        ownerFee: log.args.builderEthAmount,
        block: blockNumber,
        timestamp: timestamp,
        holderAddress: log.args.trader.toLowerCase(),
        ownerAddress: log.args.builder.toLowerCase(),
        //Transaction has been found, but not processed yet
        processed: false
      }
    });
  }

  const owner = await prisma.user.findUnique({
    where: {
      wallet: log.args.builder.toLowerCase()
    }
  });

  const holder = await prisma.user.findUnique({
    where: {
      wallet: log.args.trader.toLowerCase()
    }
  });

  //If one of the users doesn't exist, we leave the transaction as unprocessed
  if (!owner || !holder) {
    console.log("Owner or holder not found");
    return null;
  }

  const res = await prisma.$transaction(async tx => {
    let key = await tx.keyRelationship.findFirst({
      where: {
        holderId: holder.id,
        ownerId: owner.id
      }
    });

    if (!key) {
      key = await tx.keyRelationship.create({
        data: {
          holderId: holder.id,
          ownerId: owner.id,
          amount: log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount
        }
      });
    } else {
      key = await tx.keyRelationship.update({
        where: {
          id: key.id
        },
        data: {
          amount: key.amount + (log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount)
        }
      });
    }

    await tx.trade.update({
      where: {
        hash: hash
      },
      data: {
        processed: true
      }
    });

    console.log("Key relationship updated");
    return key;
  });

  //If transaction is a new key, we publish a new cast on Farcaster through the bot
  if (isNewKey && owner?.privyUserId) {
    await publishNewUserCast(owner.privyUserId);
  }

  //If transaction is an existing, we publish the trade info with a new cast on Farcaster through the bot
  if (existingKey && owner?.privyUserId && holder?.privyUserId) {
    //Show max 5 decimals
    const price = formatBigIntToFixedDecimals(log.args.ethAmount, 18, 5);
    await publishNewTradeKeysCast(owner.privyUserId, holder.privyUserId, log.args.isBuy, price);
  }

  return res;
};

export const storeTransaction = async (hash: `0x${string}`) => {
  let onchainTransaction = null;
  try {
    onchainTransaction = await viemClient.getTransactionReceipt({
      hash
    });
  } catch (err) {
    console.log("Transaction not mined yet... waiting for confirmations for: ", hash);
    onchainTransaction = await viemClient.waitForTransactionReceipt({ hash });
  }

  if (!onchainTransaction) {
    console.log("No transaction found for hash: ", hash);
    return { error: ERRORS.NOT_FOUND };
  }

  if (onchainTransaction.logs.length === 0) {
    console.log("No logs found for hash: ", hash);
    return { error: ERRORS.NOT_FOUND };
  }

  const eventLog = decodeEventLog({
    abi: builderFIV1Abi,
    data: onchainTransaction.logs[0].data,
    topics: onchainTransaction.logs[0].topics
  });

  if (!eventLog || eventLog.eventName !== "Trade") {
    console.log("No Trade event found for hash: ", hash);
    return { error: ERRORS.NOT_FOUND };
  }

  const block = await viemClient.getBlock({
    blockHash: onchainTransaction.blockHash
  });

  const keyRelationship = await storeTransactionInternal(
    eventLog,
    hash,
    onchainTransaction.blockNumber,
    block.timestamp
  );

  if (keyRelationship) {
    await sendNotification(
      keyRelationship.ownerId,
      eventLog.args.isBuy ? NotificationType.KEYBUY : NotificationType.KEYSELL,
      keyRelationship.holderId
    );
  }
  return { data: hash };
};

export const processAnyPendingTransactions = async (privyUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    }
  });

  if (!user?.isAdmin) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const systemSetting = await prisma.systemSetting.upsert({
    where: {
      key: "lastProcessedBlock"
    },
    update: {},
    create: {
      key: "lastProcessedBlock",
      value: BUILDERFI_CONTRACT.startBlock.toString()
    }
  });

  const lastProcessedBlock = BigInt(systemSetting.value);

  const latestBlock = await viemClient.getBlockNumber();

  console.log("--------------------");
  console.log("START SYNC FROM BLOCK: ", lastProcessedBlock);

  for (let i = lastProcessedBlock; i < latestBlock; i += logsRange) {
    const searchUntil = i + logsRange;
    const logs = await viemClient.getLogs({
      address: BUILDERFI_CONTRACT.address,
      event: parseAbiItem(BUIILDER_FI_V1_EVENT_SIGNATURE),
      fromBlock: i,
      toBlock: searchUntil > latestBlock ? latestBlock : searchUntil,
      strict: true
    });

    console.log("SEARCHED FROM: ", i);
    console.log("SEARCHED TO: ", searchUntil);

    for (const log of logs) {
      const block = await viemClient.getBlock({
        blockHash: log.blockHash
      });

      await storeTransactionInternal(log, log.transactionHash, log.blockNumber, block.timestamp).catch(err =>
        console.error(err)
      );
    }

    await prisma.systemSetting.update({
      where: {
        key: "lastProcessedBlock"
      },
      data: {
        value: i.toString()
      }
    });
  }

  return { data: "success" };
};

export const getTransactions = async (
  privyUserId: string,
  side: "holder" | "owner" | "both" | "all",
  offset: number
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  const transactions = await prisma.trade.findMany({
    where:
      side === "all"
        ? {}
        : side === "both"
        ? {
            OR: [
              {
                holderAddress: user.wallet.toLowerCase()
              },
              {
                ownerAddress: user.wallet.toLowerCase()
              }
            ]
          }
        : side === "owner"
        ? {
            ownerAddress: user.wallet.toLowerCase()
          }
        : {
            holderAddress: user.wallet.toLowerCase()
          },
    orderBy: {
      timestamp: "desc"
    },
    skip: offset,
    take: PAGINATION_LIMIT
  });

  const uniqueWallets = uniq([...transactions.map(t => t.holderAddress), ...transactions.map(t => t.ownerAddress)]);

  const users = await prisma.user.findMany({
    where: {
      wallet: {
        in: uniqueWallets
      }
    }
  });

  const userMap = new Map<string, (typeof users)[number]>();
  for (const user of users) {
    userMap.set(user.wallet.toLowerCase(), user);
  }

  const res = uniqBy(transactions, tx => tx.id)
    .filter(tx => userMap.has(tx.holderAddress.toLowerCase()) && userMap.has(tx.ownerAddress.toLowerCase()))
    .map(transaction => ({
      ...transaction,
      holder: userMap.get(transaction.holderAddress.toLowerCase()),
      owner: userMap.get(transaction.ownerAddress.toLowerCase())
    }));

  return { data: res };
};

export const getFriendsTransactions = async (privyUserId: string, offset: number) => {
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  const friends = await prisma.recommendedUser.findMany({
    where: {
      forId: currentUser.id,
      userId: {
        not: null
      }
    }
  });

  const friendsWallets = friends.map(friend => friend.wallet.toLowerCase());

  const transactions = await prisma.trade.findMany({
    where: {
      OR: [
        {
          holderAddress: {
            in: friendsWallets
          }
        },
        {
          ownerAddress: {
            in: friendsWallets
          }
        }
      ]
    },
    orderBy: {
      timestamp: "desc"
    },
    skip: offset,
    take: PAGINATION_LIMIT
  });

  const uniqueWallets = uniq([...transactions.map(t => t.holderAddress), ...transactions.map(t => t.ownerAddress)]);

  const users = await prisma.user.findMany({
    where: {
      wallet: {
        in: uniqueWallets
      }
    }
  });

  const userMap = new Map<string, (typeof users)[number]>();
  for (const user of users) {
    userMap.set(user.wallet.toLowerCase(), user);
  }

  const res = uniqBy(transactions, tx => tx.id)
    .filter(tx => userMap.has(tx.holderAddress.toLowerCase()) && userMap.has(tx.ownerAddress.toLowerCase()))
    .map(transaction => ({
      ...transaction,
      holder: userMap.get(transaction.holderAddress.toLowerCase()),
      owner: userMap.get(transaction.ownerAddress.toLowerCase())
    }));

  return { data: res };
};
