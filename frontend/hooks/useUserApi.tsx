import {
  createUserSA,
  getCurrentUserSA,
  getUserSA,
  refreshCurrentUserProfileSA
} from "@/backend/user/userServerActions";
import { Prisma } from "@prisma/client";
import { User as PrivyUser } from "@privy-io/react-auth";
import { useServerActionMutation } from "./useServerActionMutation";
import { useServerActionQuery } from "./useServerQuery";

export type GetCurrentUserResponse = Prisma.UserGetPayload<{
  include: { inviteCodes: true; points: true; socialProfiles: true };
}>;

export type GetUserResponse = Prisma.UserGetPayload<{ include: { socialProfiles: true } }>;

export const useCreateUser = () => {
  return useServerActionMutation(({ privyUser, inviteCode }: { privyUser: PrivyUser; inviteCode: string }, options) =>
    createUserSA(privyUser, inviteCode, options)
  );
};

export const useGetUser = (address?: string) => {
  return useServerActionQuery(["useGetUser", address], options => getUserSA(address!, options), { enabled: !!address });
};

export const useGetCurrentUser = () => {
  return useServerActionQuery(["useGetCurrentUser"], getCurrentUserSA);
};

export const useRefreshCurrentUser = () => {
  return useServerActionMutation((_, options) => refreshCurrentUserProfileSA(options));
};
