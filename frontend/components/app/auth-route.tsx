"use client";

import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { LoadingPage } from "../shared/loadingPage";

const allowAnonymousRoute = ["/profile", "/home", "/question"];
export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const { user, isAuthenticatedAndActive, isLoading } = useUserContext();
  const pathname = usePathname();
  const router = useBetterRouter();
  const redirect = useCallback(
    (path: string) => {
      if (pathname === path) return false;
      router.replace(path, { preserveSearchParams: true });
      return true;
    },
    [pathname, router]
  );

  useEffect(() => {
    if (isLoading) return;
    if (pathname === "/") {
      if (redirect("/home")) return;
    }
    if (!isAuthenticatedAndActive && !allowAnonymousRoute.some(route => pathname.startsWith(route))) {
      if (redirect("/home")) return;
    }

    if (pathname.startsWith("/admin") && !user?.isAdmin) {
      if (redirect("/home")) return;
    }

    setIsReady(true);
  }, [pathname, redirect, router, isLoading, isAuthenticatedAndActive, user?.isAdmin]);

  if (isLoading || !isReady) {
    return <LoadingPage />;
  }

  return children;
};
