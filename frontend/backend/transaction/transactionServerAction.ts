"use server";

import { ServerActionOptions, serverActionWrapper } from "../../lib/serverActionWrapper";
import { getMyTransactions, processAnyPendingTransactions, storeTransaction } from "./transaction";

export const storeTransactionSA = (hash: `0x${string}`, options: ServerActionOptions) => {
  return serverActionWrapper(() => storeTransaction(hash), options);
};

export const processPendingTransactionsSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => processAnyPendingTransactions(data.privyUserId), options);
};

export const getMyTransactionsSA = (side: "holder" | "owner" | "both", options: ServerActionOptions) => {
  return serverActionWrapper(
    data => getMyTransactions(data.privyUserId, side, options.pagination?.offset || 0),
    options
  );
};
