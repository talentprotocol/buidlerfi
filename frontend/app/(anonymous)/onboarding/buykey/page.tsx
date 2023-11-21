"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo, useTradeKey } from "@/hooks/useBuilderFiContract";
import { Button, Typography } from "@mui/joy";
import { useRouter } from "next/navigation";

export default function BuyKeyPage() {
  const router = useRouter();
  const { address } = useUserContext();
  const { buyPriceAfterFee } = useGetBuilderInfo(address!);

  const tx = useTradeKey("buy", () => router.replace("/onboarding/linkwallet"));

  const handleBuy = () => {
    tx.executeTx({ args: [address!], value: buyPriceAfterFee });
  };

  return (
    <Flex y gap={5}>
      <Flex y>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Launch your key, it&apos;s free!
        </Typography>
        <Typography level="body-sm" mt={1}>
          Unlock your builder.fi journey by creating your first key. This allows other builders to trade your keys and
          ask private questions. Launching your key is free, you only have to pay gas fees.
        </Typography>
      </Flex>
      <Flex y gap1>
        <Button onClick={handleBuy}>Create key</Button>
      </Flex>
    </Flex>
  );
}
