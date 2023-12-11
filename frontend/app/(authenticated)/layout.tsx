"use client";

import { Topbar } from "@/components/shared/top-bar";

import { BottomNav } from "@/components/shared/bottom-nav";
import { Flex } from "@/components/shared/flex";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex y grow pb={"56px"}>
      <Topbar />
      {children}
      <BottomNav />
    </Flex>
  );
}
