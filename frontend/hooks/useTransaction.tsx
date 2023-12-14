import { processPendingTransactionsSA, storeTransactionSA } from "@/backend/transaction/transactionServerAction";
import { useMutationSA } from "./useMutationSA";

export const storeTransactionAction = () => {
  return useMutationSA(async (options, hash: `0x${string}`) => {
    return storeTransactionSA(hash, options);
  });
};

export const processPendingTransactions = () => {
  return useMutationSA(async options => {
    return processPendingTransactionsSA(options);
  });
};
