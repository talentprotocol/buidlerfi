"use client";

import { getFriendsTransactions, getTransactions } from "@/backend/transaction/transaction";
import { processPendingTransactionsSA, storeTransactionSA } from "@/backend/transaction/transactionServerAction";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";
import { useMutationSA } from "./useMutationSA";

export const useStoreTransactionAction = (queryOptions?: SimpleUseQueryOptions) => {
  return useMutationSA(async (options, hash: `0x${string}`) => {
    return storeTransactionSA(hash, options);
  }, queryOptions);
};

export const useProcessPendingTransactions = () => {
  return useMutationSA(async options => {
    return processPendingTransactionsSA(options);
  });
};

export const useGetTransactions = (side: "holder" | "owner" | "both" | "all", queryOptions?: SimpleUseQueryOptions) => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getTransactions>>>(
    ["useGetTransactions", side],
    "api/transaction",
    queryOptions,
    {
      side: side
    }
  );
};

export const useGetFriendsTransactions = (queryOptions?: SimpleUseQueryOptions) => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getFriendsTransactions>>>(
    ["useGetFriendsTransactions"],
    "/api/transaction/friends",
    queryOptions
  );
};
