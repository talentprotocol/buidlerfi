import { getCurrentUserSA } from "@/backend/user/userServerActions";
import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
import { useGetNotifications } from "@/hooks/useNotificationApi";
import { usePrevious } from "@/hooks/usePrevious";
import { useQuerySA } from "@/hooks/useQuerySA";
import { User as PrivyUser, usePrivy, useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useBalance } from "wagmi";

const useGetCurrentUser = (privyUserId?: string) => {
  return useQuerySA(["useGetCurrentUser", privyUserId], getCurrentUserSA, { enabled: !!privyUserId });
};

interface UserContextType {
  user?: ReturnType<typeof useGetCurrentUser>["data"];
  privyUser?: PrivyUser;
  isAuthenticatedAndActive: boolean;
  isLoading: boolean;
  address?: `0x${string}`;
  socialAddress?: `0x${string}`;
  refetch: () => Promise<ReturnType<typeof useGetCurrentUser> | undefined>;
  refetchBalance: () => Promise<unknown>;
  balance?: bigint;
  balanceIsLoading: boolean;
  notifications?: ReturnType<typeof useGetNotifications>["data"];
  refetchNotifications: () => Promise<unknown>;
  fetchNotificationNextPage: () => Promise<unknown>;
  holding: ReturnType<typeof useGetKeyRelationships>["data"];
}
const userContext = createContext<UserContextType>({
  user: undefined,
  privyUser: undefined,
  isLoading: true,
  isAuthenticatedAndActive: false,
  address: undefined,
  refetch: () => Promise.resolve(undefined),
  refetchBalance: () => Promise.resolve(),
  balanceIsLoading: false,
  notifications: [],
  refetchNotifications: () => Promise.resolve(),
  fetchNotificationNextPage: () => Promise.resolve(),
  holding: []
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: privyUser, ready, authenticated: privyAuthenticated } = usePrivy();
  const user = useGetCurrentUser(privyUser?.id);
  const {
    data: balance,
    refetch: refetchBalance,
    isLoading: balanceIsLoading
  } = useBalance({ address: user.data?.wallet as `0x${string}` });
  const { wallets } = useWallets();
  const { setActiveWallet } = usePrivyWagmi();
  const [socialWallet, setSocialWallet] = useState<string | undefined>(undefined);
  const [mainWallet, setMainWallet] = useState<string | undefined>(undefined);
  const {
    data: notifications,
    refetch: refetchNotifications,
    fetchNextPage: fetchNotificationNextPage
  } = useGetNotifications();

  const { data: holding } = useGetKeyRelationships({ where: { holderId: user.data?.id, amount: { gt: 0 } } });

  //Ensure the active wallet is the embedded wallet from Privy
  useEffect(() => {
    const found = wallets.find(wal => wal.connectorType === "embedded");
    if (found) {
      setActiveWallet(found);
      setMainWallet(found.address);
    } else {
      setMainWallet(user.data?.wallet);
    }
  }, [setActiveWallet, user.data?.wallet, wallets]);

  //Get the non embed wallet
  useEffect(() => {
    const socialW = wallets.find(wal => wal.connectorType !== "embedded");
    if (socialW) setSocialWallet(socialW.address);
  }, [setSocialWallet, wallets]);

  const previousPrivyUser = usePrevious(privyUser);

  useEffect(() => {
    if (privyUser?.id !== previousPrivyUser?.id) {
      user.refetch();
    }
  }, [previousPrivyUser?.id, privyUser?.id, user]);

  const value = useMemo(
    () => ({
      user: user.data,
      privyUser: privyUser || undefined,
      isLoading: !ready || (!!privyUser && user.isLoading),
      isAuthenticatedAndActive: ready && !user.isLoading && !!user.data && user.data.isActive && privyAuthenticated,
      address: mainWallet ? (mainWallet as `0x${string}`) : undefined,
      socialAddress: socialWallet as `0x${string}`,
      refetch: user.refetch,
      balance: balance?.value,
      refetchBalance,
      balanceIsLoading,
      notifications,
      refetchNotifications,
      fetchNotificationNextPage,
      holding
    }),
    [
      balance?.value,
      balanceIsLoading,
      privyAuthenticated,
      privyUser,
      ready,
      refetchBalance,
      socialWallet,
      user.data,
      user.isLoading,
      user.refetch,
      mainWallet,
      notifications,
      refetchNotifications,
      fetchNotificationNextPage,
      holding
    ]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUserContext = () => useContext(userContext);
