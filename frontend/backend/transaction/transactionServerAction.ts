"use server";

import { ServerActionOptions, serverActionWrapper } from "../../lib/serverActionWrapper";
import { getTransactions, processAnyPendingTransactions, storeTransaction } from "./transaction";

export const storeTransactionSA = (hash: `0x${string}`, options: ServerActionOptions) => {
  return serverActionWrapper(() => storeTransaction(hash), options);
};

export const processPendingTransactionsSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => processAnyPendingTransactions(data.privyUserId), options);
};

export const getTransactionsSA = (side: "holder" | "owner" | "both" | "all", options: ServerActionOptions) => {
  return serverActionWrapper(data => getTransactions(data.privyUserId, side, options.pagination?.offset || 0), options);
};
