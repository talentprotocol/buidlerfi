import { useUserContext } from "@/contexts/userContext";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { useSocialData } from "@/hooks/useSocialData";
import { useGetRecommendedUser } from "@/hooks/useUserApi";
import { useCallback, useMemo } from "react";
import { useGetKeyRelationships } from "./useKeyRelationshipApi";

export const useUserProfile = (wallet?: string) => {
  const { user } = useUserContext();
  const {
    data: holders,
    refetch,
    isLoading: isLoadingHolders
  } = useGetKeyRelationships({ where: { owner: { wallet: wallet } } });

  const {
    data: holdings,
    refetch: refetchHoldings,
    isLoading: isLoadingHoldings
  } = useGetKeyRelationships({ where: { holder: { wallet: wallet } } });

  const { isLoading: isLoadingRecommendedUser, data: recommendedUser } = useGetRecommendedUser(wallet as `0x${string}`);

  const socialData = useSocialData(wallet as `0x${string}`);
  const {
    data: questions,
    refetch: refetchQuestions,
    isLoading: isQuestionsLoading
  } = useGetQuestions({ where: { replierId: socialData.userId } });

  const sortedHolders = useMemo(
    () => holders?.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()),
    [holders]
  );

  const [myShares, supporterNumber] = useMemo(() => {
    if (!holders) return [undefined, undefined];
    const index = holders.findIndex(h => h.holder.id === user?.id);
    return [holders[index], index + 1];
  }, [holders, user?.id]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetch(), refetchQuestions(), refetchHoldings()]);
  }, [refetch, refetchHoldings, refetchQuestions]);

  const value = useMemo(() => {
    return {
      holders: sortedHolders,
      holdings,
      supporterNumber,
      ownedKeysCount: Number(myShares?.amount) || 0,
      hasKeys: (myShares && myShares.amount > BigInt(0)) || false,
      isLoading: isLoadingHolders || isQuestionsLoading || isLoadingRecommendedUser || isLoadingHoldings,
      questions,
      refetch: refetchAll,
      socialData,
      recommendedUser,
      isOwnProfile: user?.wallet?.toLowerCase() === wallet?.toLowerCase()
    };
  }, [
    sortedHolders,
    holdings,
    supporterNumber,
    myShares,
    isLoadingHolders,
    isQuestionsLoading,
    isLoadingRecommendedUser,
    isLoadingHoldings,
    questions,
    refetchAll,
    socialData,
    recommendedUser,
    user?.wallet,
    wallet
  ]);

  return value;
};
