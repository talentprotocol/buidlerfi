import { getSocialFollowers, getWalletSocials } from "@/api/airstack.api";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { useQuery } from "@tanstack/react-query";

export const useGetSocialFollowers = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  return useQuery(["useGetSocialFollowers", address], () => getSocialFollowers(address!), {
    enabled: !!address,
    ...options
  });
};

export const useGetWalletSocials = (address?: `0x${string}`, options?: SimpleUseQueryOptions) => {
  if (options?.enabled) {
    console.log("useGetWalletSocials", options);
    console.trace();
  }
  return useQuery(["useGetWalletSocials", address], () => getWalletSocials(address!), {
    enabled: !!address,
    ...options
  });
};
