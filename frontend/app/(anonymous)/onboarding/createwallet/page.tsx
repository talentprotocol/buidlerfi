"use client";

import { Flex } from "@/components/shared/flex";
import { CREATE_WALLET_IMAGE } from "@/lib/assets";
import { ONBOARDING_WALLET_CREATED_KEY } from "@/lib/constants";
import { Button, Typography } from "@mui/joy";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateWalletPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex y>
          <Typography level="h3">Your builder.fi wallet</Typography>
          <Typography level="body-md" textColor="neutral.600">
            builder.fi will now create a new self-custodial wallet for you, to make the app experience much smoother
            after the onboarding.
          </Typography>
        </Flex>
      </Flex>
      <Flex y yc xc grow>
        <img src={CREATE_WALLET_IMAGE} width="100%" />
      </Flex>
      <Flex y gap1>
        <Button
          size="lg"
          loading={isLoading}
          onClick={() => {
            setIsLoading(true);
            window.localStorage.setItem(ONBOARDING_WALLET_CREATED_KEY, "true");
            router.replace("/onboarding/fund");
          }}
        >
          Create my wallet
        </Button>
      </Flex>
    </Flex>
  );
}
