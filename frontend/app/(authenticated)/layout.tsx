"use client";

import { BottomNav } from "@/components/shared/bottom-nav";
import { NavBalance } from "@/components/shared/nav-balance";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { LOGO, LOGO_SMALL } from "@/lib/assets";
import theme from "@/theme";
import { CircularProgress } from "@mui/joy";
import useMediaQuery from "@mui/material/useMediaQuery";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAuthenticated, isLoading } = useUserContext();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      redirect("/signup");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <Flex y xc yc grow>
        <CircularProgress />
      </Flex>
    );
  }

  return (
    <Flex y py={7} grow>
      <Flex
        x
        xsb
        yc
        p={2}
        sx={{ width: "calc(100% - 32px)", backgroundColor: "Background" }}
        className="h-8 fixed top-0 left-0 z-10"
      >
        <Image
          className="cursor-pointer"
          onClick={() => router.push("/home")}
          alt="App logo"
          src={isSm ? LOGO_SMALL : LOGO}
          height={30}
          width={isSm ? 30 : 150}
        />
        <NavBalance />
      </Flex>
      {children}
      <BottomNav />
    </Flex>
  );
}
