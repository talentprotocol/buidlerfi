import { ApiResponse } from "@/models/apiResponse.model";
import { Prisma, User } from "@prisma/client";
import { User as PrivyUser } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export type GetCurrentUserResponse = Prisma.UserGetPayload<{
  include: { inviteCodes: true; points: true; socialProfiles: true };
}>;

export type GetUserResponse = Prisma.UserGetPayload<{ include: { socialProfiles: true } }>;

export const useCreateUser = () => {
  const axios = useAxios();
  return useMutation(({ privyUser, inviteCode }: { privyUser: PrivyUser; inviteCode: string }) =>
    axios.post<ApiResponse<User>>("/api/users", { privyUser, inviteCode })
  );
};

export const useGetUser = (address?: string) => {
  const axios = useAxios();
  return useQuery(
    ["useGetUser", address],
    () => axios.put<ApiResponse<GetUserResponse>>(`/api/users/${address}`).then(res => res.data.data),
    { enabled: !!address }
  );
};

export const useGetCurrentUser = () => {
  const axios = useAxios();
  return useQuery(["useGetCurrentUser"], () =>
    axios.get<ApiResponse<GetCurrentUserResponse>>("/api/users/current").then(res => res.data.data)
  );
};

export const useRefreshCurrentUser = () => {
  const axios = useAxios();
  return useMutation(() => axios.put<ApiResponse<GetUserResponse>>("/api/users/current").then(res => res.data.data));
};
