import { GetFollowersResponse } from "@/app/api/airstack/followers/route";
import { AirstackSocialProfiles } from "@/lib/api/backend/airstack";
import { ApiResponse } from "@/models/apiResponse.model";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export const useGetSocialFollowers = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  const axios = useAxios();
  return useQuery(
    ["useGetSocialFollowers", address],
    () =>
      axios
        .get<ApiResponse<GetFollowersResponse>>("api/airstack/followers", { params: { address } })
        .then(res => res.data.data),
    {
      enabled: !!address,
      ...options
    }
  );
};

export const useGetWalletSocials = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  const axios = useAxios();
  return useQuery(
    ["useGetWalletSocials", address],
    () =>
      axios
        .get<ApiResponse<AirstackSocialProfiles>>("api/airstack/social", { params: { address } })
        .then(res => res.data.data),
    {
      enabled: !!address,
      ...options
    }
  );
};
