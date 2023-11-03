"use client";

import { Topbar } from "@/components/shared/top-bar";

import { Flex } from "@/components/shared/flex";
import { Sidebar } from "@/components/shared/side-bar";
import { useState } from "react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Flex y grow>
      <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <Topbar setOpen={setIsSidebarOpen} />
      {children}
    </Flex>
  );
}
