import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { useMemo } from "react";
import { useGetRecommendedUser, useGetUser } from "./useUserApi";

export interface SocialData {
  userId: number;
  wallet: `0x${string}`;
  socialAddress: string | undefined | null;
  avatarUrl: string;
  displayName: string;
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
  const { data: recommendedUser } = useGetRecommendedUser(address);

  const recommendedUserName = useMemo(() => {
    if (!recommendedUser) return undefined;

    return recommendedUser.talentProtocol, recommendedUser.ens, recommendedUser.farcaster, recommendedUser.lens;
  }, [recommendedUser]);

  const recommendedSocials = useMemo(() => {
    if (!recommendedUser) return [];
    const allRecommendedSocials = [];
    if (recommendedUser.talentProtocol)
      allRecommendedSocials.push({ dappName: "TALENT_PROTOCOL", profileName: recommendedUser.talentProtocol });
    if (recommendedUser.ens) allRecommendedSocials.push({ dappName: "ENS", profileName: recommendedUser.ens });
    if (recommendedUser.farcaster)
      allRecommendedSocials.push({ dappName: "FARCASTER", profileName: recommendedUser.farcaster });
    if (recommendedUser.lens) allRecommendedSocials.push({ dappName: "LENS", profileName: recommendedUser.lens });
    return allRecommendedSocials;
  }, [recommendedUser]);

  const socialsList = useMemo(() => {
    return user?.socialProfiles?.map(social => ({ dappName: social.type, profileName: social.profileName })) || [];
  }, [user]);

  return {
    userId: user?.id || 0,
    wallet: address,
    socialAddress: user?.socialWallet || recommendedUser?.wallet,
    avatarUrl: isLoading ? "" : user?.avatarUrl || recommendedUser?.avatarUrl || DEFAULT_PROFILE_PICTURE,
    displayName: user?.displayName || recommendedUserName || shortAddress(address),
    hasDisplayName: !!user?.displayName || !!recommendedUserName,
    socialsList: socialsList.length > 0 ? socialsList : recommendedSocials,
    isLoading: isLoading,
    refetch
  };
};
