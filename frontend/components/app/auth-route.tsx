import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUpdateUser } from "@/hooks/useUserApi";
import { MIN_BALANCE_ONBOARDING, ONBOARDING_WALLET_CREATED_KEY } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { LoadingPage } from "../shared/loadingPage";

interface Navigator extends globalThis.Navigator {
  standalone?: boolean;
}

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const user = useUserContext();
  const pathname = usePathname();
  const router = useBetterRouter();
  const updateUser = useUpdateUser();

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const { standalone } = navigator as Navigator;

  const redirect = useCallback(
    (path: string) => {
      if (pathname === path) return false;
      router.replace(path, { preserveSearchParams: true });
      return true;
    },
    [pathname, router]
  );

  const handleOnboardingRedirect = useCallback(() => {
    console.log(user.holding);
    if (user.user?.tags.length === 0 && router.searchParams.skipTags !== "1") {
      return redirect("/onboarding/tags");
    } else if (window.localStorage.getItem(ONBOARDING_WALLET_CREATED_KEY) !== "true") {
      return redirect("/onboarding/createwallet");
    } else if (
      user.balance !== undefined &&
      user.balance < MIN_BALANCE_ONBOARDING &&
      router.searchParams.skipFund !== "1"
    ) {
      return redirect("/onboarding/fund");
    } else if ((!user.holding || user.holding.length === 0) && router.searchParams.skipLaunchingKeys !== "1") {
      return redirect("/onboarding/buykey");
    } else if (!user.user?.socialWallet && router.searchParams.skiplink !== "1") {
      return redirect("/onboarding/linkwallet");
    } else if (
      !document.referrer.startsWith("android-app://") &&
      !standalone &&
      !isStandalone &&
      router.searchParams.skipInstall !== "1"
    ) {
      return redirect("/onboarding/installapp");
    } else {
      updateUser
        .mutateAsync({ hasFinishedOnboarding: true })
        .then(() => user.refetch())
        .then(() =>
          router.replace({ pathname: "/home", searchParams: { welcome: "1" } }, { preserveSearchParams: false })
        );
      return false;
    }
  }, [user, router, standalone, isStandalone, redirect, updateUser]);

  useEffect(() => {
    if (router.searchParams.inviteCode)
      window.localStorage.setItem("inviteCode", router.searchParams.inviteCode.toString());
    if (user.isLoading || updateUser.isLoading) return;

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
  }, [
    handleOnboardingRedirect,
    pathname,
    redirect,
    router,
    updateUser.isLoading,
    user,
    user.isLoading,
    user.privyUser
  ]);

  if (user.isLoading || !isReady) {
    return <LoadingPage />;
  }

  return children;
};
