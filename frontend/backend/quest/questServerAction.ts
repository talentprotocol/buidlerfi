"use server";

import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { verifyAllQuests } from "./quest";

export const verifyAllQuestsSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => verifyAllQuests(data.privyUserId), options);
};
