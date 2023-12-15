"use client";

import {
  getMyTransactionsSA,
  processPendingTransactionsSA,
  storeTransactionSA
} from "@/backend/transaction/transactionServerAction";
import { useInfiniteQuerySA } from "./useInfiniteQuerySA";
import { useMutationSA } from "./useMutationSA";

export const useStoreTransactionAction = () => {
  return useMutationSA(async (options, hash: `0x${string}`) => {
    return storeTransactionSA(hash, options);
  });
};

export const useProcessPendingTransactions = () => {
  return useMutationSA(async options => {
    return processPendingTransactionsSA(options);
  });
};

export const useGetMyGetTransactions = (side: "holder" | "owner" | "both") => {
  return useInfiniteQuerySA(["useGetMyGetTransactions"], async options => getMyTransactionsSA(side, options));
};
