"use server";

import { ServerActionOptions, serverActionWrapper } from "../../lib/serverActionWrapper";
import { processAnyPendingTransactions, storeTransaction } from "./transaction";

export const storeTransactionSA = (hash: `0x${string}`, options: ServerActionOptions) => {
  return serverActionWrapper(() => storeTransaction(hash), options);
};

export const processPendingTransactionsSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => processAnyPendingTransactions(data.privyUserId), options);
};
