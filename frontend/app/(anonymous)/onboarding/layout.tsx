"use client";

import { Flex } from "@/components/shared/flex";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { Typography } from "@mui/joy";
import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <Flex y yc grow p={2}>
      <Flex x yc xc>
        <Typography mb={3} level="body-sm" fontWeight="600" startDecorator={<img src={LOGO_BLUE_BACK} />}>
          Welcome to builder.fi
        </Typography>
      </Flex>
      {children}
    </Flex>
  );
}
