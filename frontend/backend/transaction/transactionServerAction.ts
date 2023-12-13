"use server";

import { ServerActionOptions, serverActionWrapper } from "../../lib/serverActionWrapper";
import { storeTransaction } from "./transaction";

export const storeTransactionSA = (hash: `0x${string}`, options: ServerActionOptions) => {
  return serverActionWrapper(data => storeTransaction(data.privyUserId, hash), options);
};
