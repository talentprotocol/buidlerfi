import { useUserContext } from "@/contexts/userContext";
import { useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { useGetRecommendedUser, useGetUser } from "@/hooks/useUserApi";
import { useCallback, useMemo } from "react";
import { useGetKeyRelationships } from "./useKeyRelationshipApi";

export const useUserProfile = (wallet?: string) => {
  const formattedWallet = useMemo(() => wallet?.toLowerCase(), [wallet]);
  const { user: currentUser } = useUserContext();
  const { data: holders, refetch, isLoading: isLoadingHolders } = useGetKeyRelationships(formattedWallet, "owner");

  const {
    data: holdings,
    refetch: refetchHoldings,
    isLoading: isLoadingHoldings
  } = useGetKeyRelationships(formattedWallet, "holder");

  const { isLoading: isLoadingRecommendedUser, data: recommendedUser } = useGetRecommendedUser(
    formattedWallet as `0x${string}` | undefined
  );

  const {
    data: user,
    refetch: refetchUser,
    isLoading: isLoadingUser
  } = useGetUser(formattedWallet as `0x${string}` | undefined);
  const getQuestionsFromReplierQuery = useGetQuestionsFromUser(user?.id);
  const getQuestionsFromQuestionerQuery = useGetQuestionsFromUser(user?.id, "questions");

  const sortedHolders = useMemo(
    () => holders?.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf()),
    [holders]
  );

  const [myShares, supporterNumber] = useMemo(() => {
    if (!holders) return [undefined, undefined];
    const index = holders.findIndex(h => h.holder.id === currentUser?.id);
    return [holders[index], index + 1];
  }, [holders, currentUser?.id]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetch(),
      getQuestionsFromReplierQuery.refetch(),
      refetchHoldings(),
      getQuestionsFromQuestionerQuery.refetch(),
      refetchUser()
    ]);
  }, [refetch, getQuestionsFromReplierQuery, refetchHoldings, getQuestionsFromQuestionerQuery, refetchUser]);

  return {
    holders: sortedHolders,
    holdings,
    supporterNumber,
    ownedKeysCount: Number(myShares?.amount) || 0,
    hasKeys: (myShares && myShares.amount > BigInt(0)) || false,
    isLoading:
      isLoadingHolders ||
      (user?.id && getQuestionsFromReplierQuery.isLoading) ||
      isLoadingRecommendedUser ||
      isLoadingHoldings ||
      isLoadingUser,
    questions: getQuestionsFromReplierQuery.data,
    questionsAsked: getQuestionsFromQuestionerQuery.data,
    refetch: refetchAll,
    user,
    recommendedUser,
    isOwnProfile: currentUser?.wallet?.toLowerCase() === formattedWallet,
    getQuestionsFromReplierQuery,
    getQuestionsFromQuestionerQuery,
    hasLaunchedKeys: !!holdings?.find(key => key.holder.id === key.owner.id)
  };
};
