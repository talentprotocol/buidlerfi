"use client";
import { Flex } from "@/components/shared/flex";
import { Button, Typography } from "@mui/joy";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);

  const navigateToFund = () => {
    setButtonLoading(true);
    setTimeout(() => router.push("/onboarding/fund"), 500);
  };

  return (
    <Flex y gap={4}>
      <Flex y gap={4}>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Your builder.fi wallet
        </Typography>
        <Typography level="body-md">
          welcome!
          <br />
          builder.fi will automatically create a new self-custodial wallet for you, that you fully own and control.
          <br />
          the onboarding can feel complex, but the experience will be super smooth after you&apos;re in. builder
          promise.
          <br />
          thanks for being an early supporter and helping us test the app.
        </Typography>
        <Button loading={buttonLoading} onClick={() => navigateToFund()}>
          Create wallet
        </Button>
      </Flex>
    </Flex>
  );
}
