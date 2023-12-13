import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { useSocialData } from "@/hooks/useSocialData";
import { useGetCurrentUser, useGetRecommendedUser } from "@/hooks/useUserApi";
import { useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useUserProfile = (wallet?: string) => {
  const user = useGetCurrentUser();
  const { setActiveWallet } = usePrivyWagmi();
  const { wallets } = useWallets();
  const [mainWallet, setMainWallet] = useState<string | undefined>(undefined);

  //Ensure the active wallet is the embedded wallet from Privy
  useEffect(() => {
    const found = wallets.find(wal => wal.connectorType === "embedded");
    if (found) {
      setActiveWallet(found);
      setMainWallet(found.address);
    } else {
      setMainWallet(user.data?.wallet);
    }
  }, [setActiveWallet, wallets]);

  //Ensure the active wallet is the embedded wallet from Privy
  useEffect(() => {
    const found = wallets.find(wal => wal.connectorType === "embedded");
    if (found) setActiveWallet(found);
  }, [setActiveWallet, wallets]);

  const { isLoading: isLoadingRecommendedUser, data: recommendedUser } = useGetRecommendedUser(wallet as `0x${string}`);

  const socialData = useSocialData(wallet as `0x${string}`);
  const {
    data: questions,
    refetch: refetchQuestions,
    isLoading: isQuestionsLoading
  } = useGetQuestions({ where: { replierId: socialData.userId } });
  const { data: holders, isLoading, refetch } = useGetHolders(wallet as `0x${string}`);

  const [supporterNumber, ownedKeysCount] = useMemo(() => {
    if (!holders) return [undefined, undefined];

    const holder = holders.find(holder => holder.holder.owner.toLowerCase() === mainWallet?.toLowerCase());
    if (!holder) return [undefined, 0];
    else return [Number(holder.supporterNumber), Number(holder.heldKeyNumber)];
  }, [mainWallet, holders]);

  const hasKeys = useMemo(() => !!ownedKeysCount && ownedKeysCount > 0, [ownedKeysCount]);

  const sortedHolders = useMemo(
    () => holders?.sort((a, b) => Number(a.supporterNumber) - Number(b.supporterNumber)),
    [holders]
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([refetch(), refetchQuestions()]);
  }, [refetch, refetchQuestions]);

  const value = useMemo(() => {
    return {
      holders: sortedHolders,
      supporterNumber: supporterNumber,
      ownedKeysCount: ownedKeysCount || 0,
      hasKeys,
      isLoading: isLoading || isQuestionsLoading || isLoadingRecommendedUser,
      questions,
      refetch: refetchAll,
      socialData,
      recommendedUser,
      isOwnProfile: mainWallet?.toLowerCase() === wallet?.toLowerCase()
    };
  }, [
    sortedHolders,
    supporterNumber,
    ownedKeysCount,
    hasKeys,
    isLoading,
    isQuestionsLoading,
    questions,
    refetchAll,
    socialData,
    mainWallet,
    wallet,
    isLoadingRecommendedUser,
    recommendedUser
  ]);

  return value;
};
