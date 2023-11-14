import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetActiveNetwork, useSwitchNetwork } from "@/hooks/useNetworkUtils";
import { formatError } from "@/lib/utils";
import { Button, CircularProgress, Typography } from "@mui/joy";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { parseEther, toHex } from "viem";
import { base, baseGoerli } from "viem/chains";
import { Flex } from "../shared/flex";

const supportedChain = process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? base : baseGoerli;

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const holders = useGetHolders();
  const user = useUserContext();
  const pathname = usePathname();
  const router = useBetterRouter();
  const switchNetwork = useSwitchNetwork();
  const chain = useGetActiveNetwork();

  const redirect = useCallback(
    (path: string) => {
      if (pathname === path) return false;
      router.replace(path, { preserveSearchParams: true });
      return true;
    },
    [pathname, router]
  );

  const handleAnonymousRedirect = useCallback(() => {
    if (!user.privyUser) {
      return redirect("/signup");
    } else if (user.privyUser && !user.isAuthenticatedAndActive) {
      return redirect("/signup/invitation");
    }
    return false;
  }, [redirect, user.isAuthenticatedAndActive, user.privyUser]);

  const handleOnboardingRedirect = useCallback(() => {
    if (!user.user?.socialWallet && router.searchParams.skiplink !== "1") {
      return redirect("/onboarding/linkwallet");
    } else if (!user.user?.displayName && user.user?.socialProfiles.length === 0) {
      return redirect("/onboarding/username");
    } else if (
      user.balance !== undefined &&
      user.balance < parseEther("0.001") &&
      router.searchParams.skipfund !== "1"
    ) {
      return redirect("/onboarding/fund");
    } else if (!holders.data?.length) {
      return redirect("/onboarding/buykey");
    }
  }, [
    holders.data?.length,
    redirect,
    router,
    user.balance,
    user.user?.displayName,
    user.user?.socialProfiles.length,
    user.user?.socialWallet
  ]);

  useEffect(() => {
    if (user.isLoading) return;
    if (!user.isAuthenticatedAndActive) {
      if (handleAnonymousRedirect()) return;
    } else {
      if (!user.user?.hasFinishedOnboarding) {
        if (handleOnboardingRedirect()) return;
      }

      if (pathname.startsWith("/signup") || pathname === "/") {
        if (redirect("/home")) return;
      }

      if (pathname.startsWith("/admin") && !user.user?.isAdmin) {
        if (redirect("/home")) return;
      }
    }
    setIsReady(true);
  }, [handleAnonymousRedirect, handleOnboardingRedirect, pathname, redirect, router, user]);

  if (user.isLoading || !isReady) {
    return (
      <Flex y yc xc grow>
        <CircularProgress />
      </Flex>
    );
  }

  if (
    user.isAuthenticatedAndActive &&
    user.privyUser?.wallet?.walletClientType !== "privy" &&
    chain !== toHex(supportedChain.id)
  ) {
    return (
      <Flex y yc xc grow gap3>
        <Typography>Wrong Network</Typography>
        <Button
          onClick={() =>
            switchNetwork(supportedChain.id)
              .then(() => location.reload())
              .catch(err => toast.error(formatError(err)))
          }
        >
          Switch Network
        </Button>
      </Flex>
    );
  }

  return children;
};
