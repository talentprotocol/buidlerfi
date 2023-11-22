import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { useGetUser } from "./useUserApi";

export interface SocialData {
  address: `0x${string}`;
  socialAddress: string | undefined | null;
  avatar: string;
  name: string;
  hasDisplayName: boolean;
  socialsList: {
    dappName: string;
    profileName: string;
  }[];
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}

export const useSocialData = (address: `0x${string}`, options?: { enabled?: boolean }): SocialData => {
  const { data: user, isLoading, refetch } = useGetUser(address, options);
  return {
    address: address,
    socialAddress: user?.socialWallet,
    avatar: isLoading ? "" : user?.avatarUrl || DEFAULT_PROFILE_PICTURE,
    name: user?.displayName || shortAddress(address),
    hasDisplayName: !!user?.displayName,
    socialsList:
      user?.socialProfiles?.map(social => ({ dappName: social.type, profileName: social.profileName })) || [],
    isLoading: isLoading,
    refetch
  };
};
