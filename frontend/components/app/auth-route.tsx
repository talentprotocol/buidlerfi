import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BUILDERFI_CONTRACT } from "@/lib/constants";
import { CircularProgress } from "@mui/joy";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { parseEther } from "viem";
import { useContractRead } from "wagmi";
import { Flex } from "../shared/flex";

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const user = useUserContext();
  const pathname = usePathname();
  const router = useBetterRouter();
  const { data: supporterKeys } = useContractRead({
    address: BUILDERFI_CONTRACT.address,
    abi: builderFIV1Abi,
    functionName: "builderKeysBalance",
    args: [user.user?.wallet as `0x${string}`, user.user?.wallet as `0x${string}`],
    enabled: !!user.user?.wallet
  });

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
    if (user.balance !== undefined && user.balance < parseEther("0.0005")) {
      const { pathname } = window.location;

      if (pathname.includes("fund") || pathname.includes("loading")) return;

      return redirect("/onboarding/welcome");
    } else if (Number(supporterKeys) === 0) {
      return redirect("/onboarding/buykey");
    } else if (!user.user?.socialWallet && router.searchParams.skiplink !== "1") {
      return redirect("/onboarding/linkwallet");
    } else if (!user.user?.displayName && user.user?.socialProfiles.length === 0) {
      return redirect("/onboarding/username");
    }
  }, [
    supporterKeys,
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

  return children;
};
