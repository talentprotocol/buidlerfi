import { useUserContext } from "@/contexts/userContext";
import { useGetActiveNetwork, useSwitchNetwork } from "@/hooks/useNetworkUtils";
import { formatError } from "@/lib/utils";
import { Button, CircularProgress, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { toHex } from "viem";
import { base, baseGoerli } from "viem/chains";
import { Flex } from "../shared/flex";

const supportedChain = process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? base : baseGoerli;

export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  const user = useUserContext();
  const pathname = usePathname();
  const router = useRouter();
  const {} = usePrivy();
  const switchNetwork = useSwitchNetwork();
  const chain = useGetActiveNetwork();

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

      if (pathname.startsWith("/admin") && !user.user?.isAdmin) {
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
