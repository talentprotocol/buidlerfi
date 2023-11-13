import { usePrevious } from "@/hooks/usePrevious";
import { useGetCurrentUser } from "@/hooks/useUserApi";
import { User as PrivyUser, usePrivy, useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { ReactNode, createContext, useContext, useEffect, useMemo } from "react";
import { useBalance } from "wagmi";

interface UserContextType {
  user?: ReturnType<typeof useGetCurrentUser>["data"];
  privyUser?: PrivyUser;
  isAuthenticatedAndActive: boolean;
  isLoading: boolean;
  address?: `0x${string}`;
  refetch: () => Promise<unknown>;
  refetchBalance: () => Promise<unknown>;
  balance?: bigint;
  balanceIsLoading: boolean;
}
const userContext = createContext<UserContextType>({
  user: undefined,
  privyUser: undefined,
  isLoading: true,
  isAuthenticatedAndActive: false,
  address: undefined,
  refetch: () => Promise.resolve(),
  refetchBalance: () => Promise.resolve(),
  balanceIsLoading: false
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: privyUser, ready, authenticated: privyAuthenticated } = usePrivy();
  const user = useGetCurrentUser();
  const {
    data: balance,
    refetch: refetchBalance,
    isLoading: balanceIsLoading
  } = useBalance({ address: user.data?.wallet as `0x${string}` });
  const { wallets } = useWallets();
  const { setActiveWallet } = usePrivyWagmi();

  //Ensure the active wallet is the embedded wallet from Privy
  useEffect(() => {
    const found = wallets.find(wal => wal.connectorType === "embedded");
    if (found) setActiveWallet(found);
  }, [setActiveWallet, wallets]);

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
      address: user.data?.wallet ? (user.data?.wallet as `0x${string}`) : undefined,
      refetch: user.refetch,
      balance: balance?.value,
      refetchBalance,
      balanceIsLoading
    }),
    [
      balance?.value,
      balanceIsLoading,
      privyAuthenticated,
      privyUser,
      ready,
      refetchBalance,
      user.data,
      user.isLoading,
      user.refetch
    ]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUserContext = () => useContext(userContext);
