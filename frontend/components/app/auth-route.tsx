import { useUserContext } from "@/contexts/userContext";
import { CircularProgress } from "@mui/joy";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Flex } from "../shared/flex";

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  const user = useUserContext();
  const pathname = usePathname();
  const router = useRouter();

  const redirect = useCallback(
    (path: string) => {
      if (pathname === path) return false;
      router.replace(path);
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

  useEffect(() => {
    if (user.isLoading) return;
    if (!user.isAuthenticatedAndActive) {
      const redirected = handleAnonymousRedirect();
      if (redirected) return;
    } else {
      if (pathname.startsWith("/signup") || pathname === "/") {
        const redirected = redirect("/home");
        if (redirected) return;
      }
    }
    setIsReady(true);
  }, [handleAnonymousRedirect, pathname, redirect, router, user]);

  if (user.isLoading || !isReady) {
    return (
      <Flex y yc xc grow>
        <CircularProgress />
      </Flex>
    );
  }

  return children;
};
