"use client";

import { Topbar } from "@/components/shared/top-bar";

import { Flex } from "@/components/shared/flex";
import { Sidebar } from "@/components/shared/side-bar";
import { useUserContext } from "@/contexts/userContext";
import { CircularProgress } from "@mui/joy";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useUserContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <Flex y grow>
      <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <Topbar setOpen={setIsSidebarOpen} />
      {children}
    </Flex>
  );
}
