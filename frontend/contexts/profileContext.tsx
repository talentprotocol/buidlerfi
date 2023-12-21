import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
import { useGetQuestionsFromReplier } from "@/hooks/useQuestionsApi";
import { SocialData } from "@/hooks/useSocialData";
import { useGetRecommendedUser } from "@/hooks/useUserApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams } from "next/navigation";
import { ReactNode, createContext, useContext } from "react";

interface ProfileContextType {
  holders: ReturnType<typeof useGetKeyRelationships>["data"];
  holdings: ReturnType<typeof useGetKeyRelationships>["data"];
  supporterNumber?: number;
  ownedKeysCount: number;
  hasKeys: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  socialData?: SocialData;
  recommendedUser?: ReturnType<typeof useGetRecommendedUser>["data"];
  isOwnProfile: boolean;
  questions: ReturnType<typeof useGetQuestionsFromReplier>["data"];
}

const ProfileContext = createContext<ProfileContextType>({
  hasKeys: false,
  holders: [],
  holdings: [],
  ownedKeysCount: 0,
  supporterNumber: 0,
  isLoading: true,
  refetch: () => Promise.resolve(),
  questions: [],
  isOwnProfile: false
});

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { wallet } = useParams();
  const value = useUserProfile((wallet as string).toLowerCase());

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
