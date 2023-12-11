"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { getInvitedUsers } from "./inviteCode";

export const getInvitedUsersSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => getInvitedUsers(data.privyUserId), options);
};
