"use client";

import {
  getMyTransactionsSA,
  processPendingTransactionsSA,
  storeTransactionSA
} from "@/backend/transaction/transactionServerAction";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useInfiniteQuerySA } from "./useInfiniteQuerySA";
import { useMutationSA } from "./useMutationSA";

export const useStoreTransactionAction = (queryOptions: SimpleUseQueryOptions) => {
  return useMutationSA(async (options, hash: `0x${string}`) => {
    return storeTransactionSA(hash, options);
  }, queryOptions);
};

export const useProcessPendingTransactions = () => {
  return useMutationSA(async options => {
    return processPendingTransactionsSA(options);
  });
};

export const useGetMyGetTransactions = (side: "holder" | "owner" | "both") => {
  return useInfiniteQuerySA(["useGetMyGetTransactions"], async options => getMyTransactionsSA(side, options));
};
