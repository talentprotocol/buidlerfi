"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { CircularProgress } from "@mui/joy";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function SignupLayout({ children }: { children: ReactNode }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const { privyUser, user, isLoading, isAuthenticated } = useUserContext();

  console.log({ privyUser, user, isLoading });
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      replace("/home");
      return;
    }
    if (!privyUser) {
      if (pathname !== "/signup") replace("/signup");
    } else if (!isAuthenticated) {
      if (pathname !== "/signup/invitation") replace("/signup/invitation");
    }
  }, [isAuthenticated, isLoading, pathname, privyUser, replace]);

  if (isLoading) {
    return (
      <Flex y xc yc grow>
        <CircularProgress />
      </Flex>
    );
  }

  return (
    <Flex y yc xc grow px={2}>
      {children}
    </Flex>
  );
}
