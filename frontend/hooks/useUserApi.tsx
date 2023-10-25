import { ApiResponse } from "@/models/apiResponse.model";
import { Prisma, User } from "@prisma/client";
import { User as PrivyUser } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export type GetUserResponse = Prisma.UserGetPayload<{
  include: { inviteCodes: true; points: true; socialProfiles: true };
}>;

export const useCreateUser = () => {
  return useMutation(({ privyUser, inviteCode }: { privyUser: PrivyUser; inviteCode: string }) =>
    axios.post<ApiResponse<User>>("/api/users", { privyUser, inviteCode })
  );
};

export const useGetUser = (address?: string) => {
  return useQuery(
    ["useGetUser", address],
    () => axios.put<ApiResponse<GetUserResponse>>(`/api/users/${address}`).then(res => res.data.data),
    { enabled: !!address }
  );
};
