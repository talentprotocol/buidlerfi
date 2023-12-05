"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetBuilderInfo, useTradeKey } from "@/hooks/useBuilderFiContract";
import { MIN_BALANCE_ONBOARDING } from "@/lib/constants";
import { Button, Typography } from "@mui/joy";
import { useState } from "react";

export default function BuyKeyPage() {
  const router = useBetterRouter();
  const { address, balance } = useUserContext();
  const { buyPriceAfterFee } = useGetBuilderInfo(address!);
  const [buyingKey, setBuyingKey] = useState(false);

  const tx = useTradeKey(
    "buy",
    () => {
      // give time for the TX to actually process
      setTimeout(() => {
        router.replace("/onboarding/linkwallet");
        setBuyingKey(false);
      }, 2000);
    },
    () => setBuyingKey(false)
  );

  const handleBuy = () => {
    setBuyingKey(true);
    tx.executeTx({ args: [address!], value: buyPriceAfterFee });
  };

  const skip = () => {
    router.push({ searchParams: { skipLaunchingKeys: "1" } }, { preserveSearchParams: true });
  };

  const hasEnoughBalance = balance && balance >= MIN_BALANCE_ONBOARDING;

  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex y>
          <Typography my={1} level="h3">
            Create your keys
          </Typography>
          <Flex y gap3>
            <Typography level="body-md" textColor="neutral.600">
              To allow others to ask you questions*, you need to create your keys. The first key is free (you just need
              to pay gas fees).
            </Typography>
            <Typography level="body-md" textColor="neutral.600">
              Launching a key creates a market, and every time someone buys or sells your keys, you earn a 5% fee.
            </Typography>
            <Typography level="body-xs" textColor="neutral.600">
              *You&apos;re under no obligation to answer questions from your key holders. Buying a key just gives them
              the right to ask a question, not to a guaranteed response.
            </Typography>
          </Flex>
        </Flex>
      </Flex>
      <Flex y gap1>
        <Button size="lg" fullWidth loading={buyingKey} onClick={handleBuy} disabled={!hasEnoughBalance}>
          Create keys
        </Button>
        <Button size="lg" fullWidth variant="plain" onClick={skip}>
          Decide later
        </Button>
      </Flex>
    </Flex>
  );
}
