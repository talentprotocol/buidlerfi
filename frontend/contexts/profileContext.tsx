import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams } from "next/navigation";
import { ReactNode, createContext, useContext } from "react";

interface RecommendedUser {
  userId: number | null;
  wallet: string;
  avatarUrl: string | null;
  ens: string | null;
  farcaster: string | null;
  lens: string | null;
  talentProtocol: string | null;
  createdAt: Date;
  questions?: number;
  replies?: number;
}

interface ProfileContextType {
  holders: ReturnType<typeof useGetHolders>["data"];
  supporterNumber?: number;
  ownedKeysCount: number;
  hasKeys: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  socialData: SocialData;
  recommendedUser?: RecommendedUser;
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
    avatarUrl: "",
    createdAt: new Date(),
    ens: "",
    farcaster: "",
    lens: "",
    questions: 0,
    replies: 0,
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
