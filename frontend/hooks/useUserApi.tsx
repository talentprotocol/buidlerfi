import { UpdateUserArgs } from "@/backend/user/user";
import {
  checkUsersExistSA,
  createUserSA,
  getCurrentUserSA,
  getUserSA,
  linkNewWalletSA,
  refreshCurrentUserProfileSA,
  updateUserSA
} from "@/backend/user/userServerActions";
import { Prisma } from "@prisma/client";
import { usePrivy } from "@privy-io/react-auth";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export type GetCurrentUserResponse = Prisma.UserGetPayload<{
  include: { inviteCodes: true; points: true; socialProfiles: true };
}>;

export type GetUserResponse = Prisma.UserGetPayload<{ include: { socialProfiles: true } }>;

export const useCreateUser = () => {
  return useMutationSA(async (options, inviteCode: string) => {
    return createUserSA(inviteCode, options);
  });
};

export const useGetUser = (address?: string) => {
  return useQuerySA(["useGetUser", address], async options => getUserSA(address!, options), { enabled: !!address });
};

export const useGetCurrentUser = () => {
  const { user } = usePrivy();
  return useQuerySA(["useGetCurrentUser", user?.id], getCurrentUserSA);
};

export const useRefreshCurrentUser = () => {
  return useMutationSA(async options => refreshCurrentUserProfileSA(options));
};

export const useCheckUsersExist = (wallets?: string[]) => {
  return useQuerySA(["useCheckUsersExist", wallets], async options => checkUsersExistSA(wallets!, options), {
    enabled: !!wallets
  });
};

export const useLinkWallet = () => {
  return useMutationSA(async (options, wallet: string) => linkNewWalletSA(wallet, options));
};

export const useUpdateUser = () => {
  return useMutationSA(async (options, updatedUser: UpdateUserArgs) => updateUserSA(updatedUser, options));
};
