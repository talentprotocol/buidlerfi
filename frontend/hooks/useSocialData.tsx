import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { useGetUser } from "./useUserApi";

export interface SocialData {
  address: `0x${string}`;
  avatar: string;
  name: string;
  socialsList: {
    dappName: string;
    profileName: string;
  }[];
}

export const useSocialData = (address: `0x${string}`): SocialData => {
  const { data: user } = useGetUser(address);
  return {
    address: address,
    avatar: user?.avatarUrl || DEFAULT_PROFILE_PICTURE,
    name: user?.displayName || address,
    socialsList: user?.socialProfiles?.map(social => ({ dappName: social.type, profileName: social.profileName })) || []
  };
};
