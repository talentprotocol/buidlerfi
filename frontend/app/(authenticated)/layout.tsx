"use client";

import { BottomNav } from "@/components/shared/bottom-nav";
import { Topbar } from "@/components/shared/top-bar";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { CircularProgress } from "@mui/joy";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
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
    <Flex y grow pb="64px">
      <Topbar />
      {children}
      <BottomNav />
    </Flex>
  );
}
