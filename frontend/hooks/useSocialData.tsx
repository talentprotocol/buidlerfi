import { useGetUser } from "./useUserApi";

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
  return {
    userId: user?.id || 0,
    wallet: address,
    socialAddress: user?.socialWallet,
    avatarUrl: isLoading ? "" : user?.avatarUrl || "",
    displayName: user?.displayName || "",
    hasDisplayName: !!user?.displayName,
    socialsList:
      user?.socialProfiles?.map(social => ({ dappName: social.type, profileName: social.profileName })) || [],
    isLoading: isLoading,
    refetch
  };
};
