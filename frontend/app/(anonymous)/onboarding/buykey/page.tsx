"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo, useTradeKey } from "@/hooks/useBuilderFiContract";
import { Button, Typography } from "@mui/joy";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BuyKeyPage() {
  const router = useRouter();
  const { address } = useUserContext();
  const { buyPriceAfterFee } = useGetBuilderInfo(address!);
  const [buyingKey, setBuyingKey] = useState(false);

  const tx = useTradeKey("buy", () => {
    // give time for the TX to actually process
    setTimeout(() => {
      router.replace("/onboarding/linkwallet");
      setBuyingKey(false);
    }, 2000);
  });

  const handleBuy = () => {
    setBuyingKey(true);
    tx.executeTx({ args: [address!], value: buyPriceAfterFee });
  };

  const skip = () => {
    router.replace("/onboarding/linkwallet?skipLaunchingKeys=1");
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
        <Button loading={buyingKey} onClick={handleBuy}>
          Create key
        </Button>
        <Button variant="plain" onClick={skip}>
          Skip
        </Button>
      </Flex>
    </Flex>
  );
}
