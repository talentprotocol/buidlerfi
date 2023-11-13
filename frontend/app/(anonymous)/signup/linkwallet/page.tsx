"use client";

import { Flex } from "@/components/shared/flex";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";

export default function CreateWallet() {
  const { linkWallet } = usePrivy();
  return (
    <Flex grow y gap3>
      <Flex y gap1>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          builder.fi is better <b /> with friends.
        </Typography>
        <Typography level="body-sm" mt={1}>
          A wallet has been generated for you by builder.fi. However, you can still link your main wallet to display
          your Lens or Farcaster profile and get recommendations.
        </Typography>
      </Flex>
      <Button onClick={linkWallet}>Link your wallet</Button>
    </Flex>
  );
}
