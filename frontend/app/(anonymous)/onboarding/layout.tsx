"use client";

import { Flex } from "@/components/shared/flex";
import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <Flex y yc grow p={2}>
      {children}
    </Flex>
  );
}
