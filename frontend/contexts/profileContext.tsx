import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams } from "next/navigation";
import { ReactNode, createContext, useContext } from "react";

interface ProfileContextType {
  holders: ReturnType<typeof useGetHolders>["data"];
  supporterNumber?: number;
  ownedKeysCount: number;
  hasKeys: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  socialData: SocialData;
  recommendedUser?: ReturnType<typeof useGetRecommendedUser>["data"];
  isOwnProfile: boolean;
  questions: ReturnType<typeof useGetQuestions>["data"];
}

const ProfileContext = createContext<ProfileContextType>({
  hasKeys: false,
  holders: [],
  ownedKeysCount: 0,
  supporterNumber: 0,
  isLoading: true,
  refetch: () => Promise.resolve(),
  questions: [],
  socialData: {
    userId: 0,
    wallet: "0x",
    avatarUrl: "",
    hasDisplayName: false,
    isLoading: true,
    displayName: "",
    refetch: () => Promise.resolve(),
    socialAddress: "",
    socialsList: []
  },
  recommendedUser: {
    forId: 0,
    id: 0,
    recommendationScore: 0,
    avatarUrl: "",
    updatedAt: new Date(),
    createdAt: new Date(),
    ens: "",
    farcaster: "",
    lens: "",
    talentProtocol: "",
    userId: 0,
    wallet: ""
  },
  isOwnProfile: false
});

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { wallet } = useParams();
  const value = useUserProfile(wallet as string);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
