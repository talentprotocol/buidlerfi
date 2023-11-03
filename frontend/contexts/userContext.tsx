import { usePrevious } from "@/hooks/usePrevious";
import { useGetCurrentUser } from "@/hooks/useUserApi";
import { User as PrivyUser, usePrivy } from "@privy-io/react-auth";
import { ReactNode, createContext, useContext, useEffect, useMemo } from "react";

interface UserContextType {
  user?: ReturnType<typeof useGetCurrentUser>["data"];
  privyUser?: PrivyUser;
  isAuthenticatedAndActive: boolean;
  isLoading: boolean;
  address?: `0x${string}`;
  refetch: () => Promise<unknown>;
}
const userContext = createContext<UserContextType>({
  user: undefined,
  privyUser: undefined,
  isLoading: true,
  isAuthenticatedAndActive: false,
  address: undefined,
  refetch: () => Promise.resolve()
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: privyUser, ready, authenticated: privyAuthenticated } = usePrivy();
  const user = useGetCurrentUser();

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
      address: privyUser?.wallet?.address ? (privyUser?.wallet?.address as `0x${string}`) : undefined,
      refetch: user.refetch
    }),
    [privyAuthenticated, privyUser, ready, user.data, user.isLoading, user.refetch]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUserContext = () => useContext(userContext);
