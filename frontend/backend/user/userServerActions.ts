"use server";

import { ServerActionOptions, serverActionWrapper } from "../../lib/serverActionWrapper";
import {
  UpdateUserArgs,
  checkUsersExist,
  createUser,
  generateChallenge,
  getBulkUsers,
  getCurrentUser,
  getUser,
  linkNewWallet,
  refreshAllUsersProfile,
  refreshCurrentUserProfile,
  updateUser
} from "./user";

export const getCurrentUserSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => getCurrentUser(data.privyUserId), options);
};

export const getUserSA = (wallet: string, options: ServerActionOptions) => {
  return serverActionWrapper(() => getUser(wallet), options);
};

export const createUserSA = (inviteCode: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => createUser(data.privyUserId, inviteCode), options);
};

export const refreshCurrentUserProfileSA = (options: ServerActionOptions) => {
  return serverActionWrapper(data => refreshCurrentUserProfile(data.privyUserId), options);
};

export const checkUsersExistSA = (wallets: string[], options: ServerActionOptions) => {
  return serverActionWrapper(() => checkUsersExist(wallets), options);
};

//This is an admin action
export const refreshAllUsersProfileSA = (options: ServerActionOptions) => {
  return serverActionWrapper(() => refreshAllUsersProfile(), options, true);
};

export const linkNewWalletSA = (signature: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => linkNewWallet(data.privyUserId, signature), options);
};

export const updateUserSA = (updatedUser: UpdateUserArgs, options: ServerActionOptions) => {
  return serverActionWrapper(data => updateUser(data.privyUserId, updatedUser), options);
};

export const generateChallengeSA = (publicKey: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => generateChallenge(data.privyUserId, publicKey), options);
};

export const getBulkUsersSA = (addresses: string[], options: ServerActionOptions) => {
  return serverActionWrapper(() => getBulkUsers(addresses), options);
};
