"use client";

import { Flex } from "@/components/shared/flex";
import { useGetUser } from "@/hooks/useUserApi";
import { CircularProgress } from "@mui/joy";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  //Waiting for backend and privy authentication
  const user = useGetUser("test");

  useEffect(() => {
    if (user.isLoading) return;
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
