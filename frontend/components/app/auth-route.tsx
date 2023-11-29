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

  const handleOnboardingRedirect = useCallback(() => {
    if (user.balance !== undefined && user.balance < parseEther("0.0005")) {
      const { pathname } = window.location;

      if (pathname.includes("fund") || pathname.includes("loading")) return;

      return redirect("/onboarding/welcome");
    } else if (Number(supporterKeys) === 0 && router.searchParams.skipLaunchingKeys !== "1") {
      return redirect("/onboarding/buykey");
    } else if (!user.user?.socialWallet && !user.user?.displayName && router.searchParams.skiplink !== "1") {
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

    // user has not logged in with privy yet so send him to the signup page
    if (!user.privyUser) {
      redirect("/signup");
      setIsReady(true);
      return;
    }

    // this means the user does not have an invite code
    if (!user.user?.invitedById) {
      redirect("/signup/invitation");
      setIsReady(true);
      return;
    }

    // this means that the user has not done the onboarding
    if (!user.user?.hasFinishedOnboarding) {
      if (handleOnboardingRedirect()) return;
    }

    // if the user has finished the onboarding then we should NEVER send him there again
    if (user.user?.hasFinishedOnboarding) {
      if (pathname === "/") {
        if (redirect("/home")) return;
      }
      if (pathname.startsWith("/onboarding")) {
        if (redirect("/home")) return;
      }

      if (pathname.startsWith("/signup")) {
        if (redirect("/home")) return;
      }

      if (pathname.startsWith("/admin") && !user.user?.isAdmin) {
        if (redirect("/home")) return;
      }
    }

    setIsReady(true);
  }, [handleOnboardingRedirect, pathname, redirect, router, user, user.isLoading, user.privyUser]);

  if (user.isLoading || !isReady) {
    return (
      <Flex y yc xc grow>
        <CircularProgress />
      </Flex>
    );
  }

  return children;
};
