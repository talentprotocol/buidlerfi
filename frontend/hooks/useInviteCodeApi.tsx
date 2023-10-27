import { ApiResponse } from "@/models/apiResponse.model";
import { InviteCode } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export const useGenerateInviteCodes = () => {
  const axios = useAxios();
  return useMutation(() => axios.post<ApiResponse<InviteCode[]>>("/api/invitecode"));
};
