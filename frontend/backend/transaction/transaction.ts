"use server";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BUIILDER_FI_V1_EVENT_SIGNATURE, BUILDERFI_CONTRACT, IN_USE_CHAIN_ID, PAGINATION_LIMIT } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import viemClient from "@/lib/viemClient";
import { NotificationType } from "@prisma/client";
import _ from "lodash";
import { decodeEventLog, parseAbiItem } from "viem";
import { sendNotification } from "../notification/notification";

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
  let transaction = await prisma.trade.findFirst({
    where: {
      hash: hash
    }
  });

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
        holderAddress: log.args.builder.toLowerCase(),
        ownerAddress: log.args.trader.toLowerCase()
      }
    });
  }

  console.log("Searching owner: " + log.args.builder.toLowerCase());
  const owner = await prisma.user.findUniqueOrThrow({
    where: {
      wallet: log.args.builder.toLowerCase()
    }
  });

  console.log("Searching holder: " + log.args.trader.toLowerCase());
  const holder = await prisma.user.findUniqueOrThrow({
    where: {
      wallet: log.args.trader.toLowerCase()
    }
  });

  const res = await prisma.$transaction(async tx => {
    const key = await tx.keyRelationship.findFirst({
      where: {
        holderId: holder.id,
        ownerId: owner.id
      }
    });

    if (!key) {
      return await tx.keyRelationship.create({
        data: {
          holderId: holder.id,
          ownerId: owner.id,
          amount: log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount
        }
      });
    }

    return await tx.keyRelationship.update({
      where: {
        id: key.id
      },
      data: {
        amount: key.amount + (log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount)
      }
    });
  });

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

  await sendNotification(
    keyRelationship.ownerId,
    keyRelationship.holderId,
    eventLog.args.isBuy ? NotificationType.KEYBUY : NotificationType.KEYSELL
  );

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

  for (let i = lastProcessedBlock; i < latestBlock; i += 100n) {
    const searchUntil = i + 100n;
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

      await storeTransactionInternal(log, log.blockHash, log.blockNumber, block.timestamp).catch(err =>
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

export const getMyTransactions = async (privyUserId: string, side: "holder" | "owner" | "both", offset: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  const transactions = await prisma.trade.findMany({
    where:
      side === "both"
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
      timestamp: "asc"
    },
    skip: offset,
    take: PAGINATION_LIMIT
  });

  const uniqueWallets = _.uniq([...transactions.map(t => t.holderAddress), ...transactions.map(t => t.ownerAddress)]);

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

  const res = transactions
    .filter(tx => userMap.has(tx.holderAddress.toLowerCase()) && userMap.has(tx.ownerAddress.toLowerCase()))
    .map(transaction => ({
      ...transaction,
      holder: userMap.get(transaction.holderAddress.toLowerCase()),
      owner: userMap.get(transaction.ownerAddress.toLowerCase())
    }));

  return { data: res };
};
