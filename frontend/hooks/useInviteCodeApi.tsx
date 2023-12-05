import { getInvitedUsersSA } from "@/backend/inviteCode/inviteCodeServerActions";
import { ApiResponse } from "@/models/apiResponse.model";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { InviteCode } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useQuerySA } from "./useQuerySA";

export const useGenerateInviteCodes = () => {
  const axios = useAxios();
  return useMutation(() => axios.post<ApiResponse<InviteCode[]>>("/api/invitecode"));
};

export function useGetInvitedUsers(queryOptions?: SimpleUseQueryOptions) {
  return useQuerySA(["useGetInvitedUsers"], options => getInvitedUsersSA(options), {
    ...queryOptions
  });
}
