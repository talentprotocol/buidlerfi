import { GetUsersArgs, UpdateUserArgs } from "@/backend/user/user";
import {
  checkUsersExistSA,
  createUserSA,
  generateChallengeSA,
  getRecommendedUserSA,
  getRecommendedUsersSA,
  getTopUsersSA,
  getUserSA,
  getUserStatsSA,
  getUsersSA,
  linkNewWalletSA,
  refreshCurrentUserProfileSA,
  searchSA,
  updateUserSA
} from "@/backend/user/userServerActions";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { Prisma } from "@prisma/client";
import { useDebounce } from "./useDebounce";
import { useInfiniteQuerySA } from "./useInfiniteQuerySA";
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

export const useGetUser = (address?: string, reactQueryOptions?: { enabled?: boolean }) => {
  return useQuerySA(["useGetUser", address], async options => getUserSA(address!, options), {
    enabled: !!address,
    ...reactQueryOptions
  });
};

export const useGetUsers = (args: GetUsersArgs) => {
  return useInfiniteQuerySA(["useGetUsers"], async options => getUsersSA(args, options));
};

export const useGetTopUsers = () => {
  return useInfiniteQuerySA(["useGetTopUsers"], async options => getTopUsersSA(options));
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
  return useMutationSA(async (options, signature: string) => linkNewWalletSA(signature, options));
};

export const useUpdateUser = () => {
  return useMutationSA(async (options, updatedUser: UpdateUserArgs) => updateUserSA(updatedUser, options));
};

export const useGenerateChallenge = () => {
  return useMutationSA(async (options, publicKey: string) => generateChallengeSA(publicKey, options));
};

export const useGetRecommendedUser = (address?: string) => {
  return useQuerySA(["useGetRecommendedUser", address], async options => getRecommendedUserSA(address!, options), {
    enabled: !!address
  });
};

export const useRecommendedUsers = (wallet: string) => {
  return useQuerySA(["useRecommendedUsers", wallet], async options => getRecommendedUsersSA(wallet, options));
};

export const useSearch = (searchValue: string, queryOptions?: SimpleUseQueryOptions) => {
  const debouncedValue = useDebounce(searchValue, 500);
  return useInfiniteQuerySA(["useSearch", debouncedValue], async options => searchSA(debouncedValue, options), {
    enabled: !!debouncedValue,
    ...queryOptions
  });
};

export const useGetUserStats = (userId?: number) => {
  return useQuerySA(["useGetUserStats", userId], async options => getUserStatsSA(userId!, options), {
    enabled: !!userId
  });
};
