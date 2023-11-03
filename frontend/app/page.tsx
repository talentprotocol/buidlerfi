"use client";

import { Flex } from "@/components/shared/flex";
import { CircularProgress } from "@mui/joy";

export default function RootPage() {
  return (
    <Flex y yc xc grow>
      <CircularProgress />
    </Flex>
  );
}
