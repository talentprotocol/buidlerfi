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
    <Flex y grow gap2 component={"main"} px={4} py={2}>
      <Typography level="h3">Your builder.fi wallet</Typography>
      <Flex y mb={4} mt={2} gap2>
        <Typography level="body-md" mb={12}>
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
