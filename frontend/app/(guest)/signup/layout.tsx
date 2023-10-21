"use client";

import { Flex } from "@/components/shared/flex";
import { ReactNode } from "react";

export default function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <Flex y yc xc grow px={2}>
      {children}
    </Flex>
  );
}
