"use server";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { IN_USE_CHAIN_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { createPublicClient, decodeEventLog, http } from "viem";
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
