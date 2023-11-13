"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo, useTradeKey } from "@/hooks/useBuilderFiContract";
import { useUpdateUser } from "@/hooks/useUserApi";
import { Button, Typography } from "@mui/joy";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function BuyKeyPage() {
  const router = useRouter();
  const { address, refetch } = useUserContext();
  const { buyPriceAfterFee } = useGetBuilderInfo(address!);
  const updateUser = useUpdateUser();

  const finishOnboarding = useMutation(async () => {
    await updateUser.mutateAsync({ hasFinishedOnboarding: true });
    await refetch();
    router.replace("/home");
  });

  const tx = useTradeKey("buy", finishOnboarding.mutate);

  const handleBuy = () => {
    tx.executeTx({ args: [address!], value: buyPriceAfterFee });
  };

  return (
    <Flex y gap={5}>
      <Flex y>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Buy your first key, it&apos;s free
        </Typography>
        <Typography level="body-sm" mt={1}>
          By buying your first key, you will allow other users to buy your keys, and ask you questions
        </Typography>
      </Flex>
      <Flex y gap1>
        <Button onClick={handleBuy}>Buy key</Button>
        <Button loading={finishOnboarding.isLoading} onClick={() => finishOnboarding.mutate()} variant="plain">
          Skip
        </Button>
      </Flex>
    </Flex>
  );
}
