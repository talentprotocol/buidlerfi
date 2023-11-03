"use server";

import { privyUser } from "@/models/helpers.model";
import { ServerActionOptions, serverActionWrapper } from "../../lib/serverActionWrapper";
import { createUser, getCurrentUser, getUser, refreshCurrentUserProfile } from "./user";

export const getCurrentUserSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => getCurrentUser(data.userId), options);
};

export const getUserSA = (wallet: string, options: ServerActionOptions) => {
  return serverActionWrapper(() => getUser(wallet), options);
};

export const createUserSA = (privyUser: privyUser, inviteCode: string, options: ServerActionOptions) => {
  return serverActionWrapper(() => createUser(privyUser, inviteCode), options);
};

export const refreshCurrentUserProfileSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => refreshCurrentUserProfile(data.userId), options);
};
