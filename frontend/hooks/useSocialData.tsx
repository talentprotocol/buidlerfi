import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { useGetUser } from "./useUserApi";

export interface SocialData {
  address: `0x${string}`;
  socialAddress: string | undefined | null;
  avatar: string;
  name: string;
  socialsList: {
    dappName: string;
    profileName: string;
  }[];
  isLoading: boolean;
}

export const useSocialData = (address: `0x${string}`): SocialData => {
  const { data: user, isLoading } = useGetUser(address);
  return {
    address: address,
    socialAddress: user?.socialWallet,
    avatar: isLoading ? "" : user?.avatarUrl || DEFAULT_PROFILE_PICTURE,
    name: user?.displayName || shortAddress(address),
    socialsList:
      user?.socialProfiles?.map(social => ({ dappName: social.type, profileName: social.profileName })) || [],
    isLoading: isLoading
  };
};
