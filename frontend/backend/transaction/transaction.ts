"use server";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BUIILDER_FI_V1_EVENT_SIGNATURE, BUILDERFI_CONTRACT, IN_USE_CHAIN_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createPublicClient, decodeEventLog, http, parseAbiItem } from "viem";
import { base, baseGoerli } from "viem/chains";

export const storeTransaction = async (privyUserId: string, hash: `0x${string}`) => {
  const client = createPublicClient({
    chain: process.env.NODE_ENV === "production" ? base : baseGoerli,
    transport: http(process.env.INFURA_API_KEY)
  });

  const onchainTransaction = await client.getTransactionReceipt({
    hash
  });

  if (!onchainTransaction) {
    console.log("No transaction found for hash: ", hash);
    return { data: null };
  }

  if (onchainTransaction.logs.length == 0) {
    console.log("No logs found for hash: ", hash);
    return { data: null };
  }

  const eventLog = decodeEventLog({
    abi: builderFIV1Abi,
    data: onchainTransaction.logs[0].data,
    topics: onchainTransaction.logs[0].topics
  });

  if (!eventLog || eventLog.eventName !== "Trade") {
    console.log("No Trade event found for hash: ", hash);
    return { data: null };
  }

  let transaction = await prisma.transaction.findFirst({
    where: {
      hash: hash
    }
  });

  if (!transaction) {
    transaction = await prisma.transaction.create({
      data: {
        hash: hash,
        chainId: IN_USE_CHAIN_ID
      }
    });
  }

  const owner = await prisma.user.findUnique({
    where: {
      wallet: eventLog.args.builder.toLowerCase()
    }
  });

  const holder = await prisma.user.findUnique({
    where: {
      wallet: eventLog.args.trader.toLowerCase()
    }
  });

  const key = await prisma.key.findFirst({
    where: {
      transactionId: transaction.id
    }
  });

  if (!key) {
    await prisma.key.create({
      data: {
        holderId: !!holder ? holder.id : null,
        ownerId: !!owner ? owner.id : null,
        transactionId: transaction.id,
        amount: eventLog.args.isBuy ? eventLog.args.shareAmount : -eventLog.args.shareAmount,
        ethCost: eventLog.args.ethAmount,
        protocolFee: eventLog.args.protocolEthAmount,
        ownerFee: eventLog.args.builderEthAmount,
        block: onchainTransaction.blockNumber,
        chainId: IN_USE_CHAIN_ID
      }
    });
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
    return { data: null };
  }

  const client = createPublicClient({
    chain: process.env.NODE_ENV === "production" ? base : baseGoerli,
    transport: http(process.env.INFURA_API_KEY)
  });

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

  const latestBlock = await client.getBlockNumber();

  console.log("--------------------");
  console.log("START SYNC FROM BLOCK: ", lastProcessedBlock);

  for (let i = lastProcessedBlock; i < latestBlock; i += 100n) {
    const searchUntil = i + 100n;
    const logs = await client.getLogs({
      address: BUILDERFI_CONTRACT.address,
      event: parseAbiItem(BUIILDER_FI_V1_EVENT_SIGNATURE),
      fromBlock: i,
      toBlock: searchUntil > latestBlock ? latestBlock : searchUntil,
      strict: true
    });

    console.log("SEARCHED FROM: ", i);
    console.log("SEARCHED TO: ", searchUntil);

    for await (const log of logs) {
      let transaction = await prisma.transaction.findFirst({
        where: {
          hash: log.transactionHash
        }
      });

      if (!transaction) {
        transaction = await prisma.transaction.create({
          data: {
            hash: log.transactionHash,
            chainId: IN_USE_CHAIN_ID
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

      const key = await prisma.key.findFirst({
        where: {
          transactionId: transaction.id
        }
      });

      if (!key) {
        await prisma.key.create({
          data: {
            holderId: !!holder ? holder.id : null,
            ownerId: !!owner ? owner.id : null,
            transactionId: transaction.id,
            amount: log.args.isBuy ? log.args.shareAmount : -log.args.shareAmount,
            ethCost: log.args.ethAmount,
            protocolFee: log.args.protocolEthAmount,
            ownerFee: log.args.builderEthAmount,
            block: log.blockNumber,
            chainId: IN_USE_CHAIN_ID
          }
        });
      }
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

  return { data: null };
};
