"use client";

import { Topbar } from "@/components/shared/top-bar";

import { BottomNav } from "@/components/shared/bottom-nav";
import { Flex } from "@/components/shared/flex";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex y grow>
      <Topbar />
      <Flex y grow>
        {children}
      </Flex>
      <BottomNav />
    </Flex>
  );
}
