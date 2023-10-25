"use client";

import { Flex } from "@/components/shared/flex";
import { useGetUser } from "@/hooks/useUserApi";
import { CircularProgress } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { user: privyUser } = usePrivy();
  const user = useGetUser(privyUser?.wallet?.address);

  console.log({ privyUser, user });
  useEffect(() => {
    if (user.isInitialLoading) return;
    if (!user.data) {
      //Not found ?
      redirect("/signup");
    } else {
      redirect("/home");
    }
  }, [user]);

  return (
    <Flex y yc xc grow>
      <CircularProgress />
    </Flex>
  );
}
