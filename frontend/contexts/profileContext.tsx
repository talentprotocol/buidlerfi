import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { SocialData, useSocialData } from "@/hooks/useSocialData";
import { useGetCurrentUser } from "@/hooks/useUserApi";
import { useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useParams } from "next/navigation";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface ProfileContextType {
  holders: ReturnType<typeof useGetHolders>["data"];
  supporterNumber?: number;
  ownedKeysCount: number;
  hasKeys: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  socialData: SocialData;
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
  isOwnProfile: false
});

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
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

  const { wallet } = useParams();
  const socialData = useSocialData(wallet as `0x${string}`);
  const {
    data: questions,
    refetch: refetchQuestions,
    isLoading: isQuestionsLoading
  } = useGetQuestions(socialData.userId);
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
      isLoading: isLoading || isQuestionsLoading,
      questions,
      refetch: refetchAll,
      socialData,
      isOwnProfile: mainWallet?.toLowerCase() === (wallet as string).toLowerCase()
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
    wallet
  ]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
