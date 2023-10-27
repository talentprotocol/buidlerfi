import { GetCurrentUserResponse, useGetCurrentUser } from "@/hooks/useUserApi";
import { User as PrivyUser, usePrivy } from "@privy-io/react-auth";
import { ReactNode, createContext, useContext, useMemo } from "react";

interface UserContextType {
  user?: GetCurrentUserResponse;
  privyUser?: PrivyUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  address?: `0x${string}`;
  refetch: () => Promise<unknown>;
}
const userContext = createContext<UserContextType>({
  user: undefined,
  privyUser: undefined,
  isLoading: true,
  isAuthenticated: false,
  address: undefined,
  refetch: () => Promise.resolve()
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: privyUser, ready } = usePrivy();
  const user = useGetCurrentUser();
  const value = useMemo(
    () => ({
      user: user.data,
      privyUser: privyUser || undefined,
      isLoading: !ready || privyUser ? user.isLoading : false,
      isAuthenticated: ready && !user.isLoading && !!user.data && user.data.isActive,
      address: privyUser?.wallet?.address ? (privyUser?.wallet?.address as `0x${string}`) : undefined,
      refetch: user.refetch
    }),
    [privyUser, ready, user.data, user.isLoading, user.refetch]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUserContext = () => useContext(userContext);
