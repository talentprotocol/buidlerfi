import { getCurrentUser } from "@/backend/user/user";
import { useAxios } from "@/hooks/useAxios";
import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
import { useGetNotifications } from "@/hooks/useNotificationApi";
import { usePrevious } from "@/hooks/usePrevious";
import { User as PrivyUser, usePrivy, useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useBalance } from "wagmi";

const useGetCurrentUser = (privyUserId?: string) => {
  const axios = useAxios();
  return useQuery(
    ["useGetCurrentUser", privyUserId],
    () =>
      axios
        .get<ReturnType<typeof getCurrentUser>>("/api/user/me")
        .then(res => res.data)
        .then(res => res.data),
    { enabled: !!privyUserId }
  );
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
  holders: ReturnType<typeof useGetKeyRelationships>["data"];
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
  holding: [],
  holders: []
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

  const { data: holding } = useGetKeyRelationships(user.data?.wallet, "holder");
  const { data: holders } = useGetKeyRelationships(user.data?.wallet, "owner");

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
      holding,
      holders
    }),
    [
      user.data,
      user.isLoading,
      user.refetch,
      privyUser,
      ready,
      privyAuthenticated,
      mainWallet,
      socialWallet,
      balance?.value,
      refetchBalance,
      balanceIsLoading,
      notifications,
      refetchNotifications,
      fetchNotificationNextPage,
      holding,
      holders
    ]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUserContext = () => useContext(userContext);
