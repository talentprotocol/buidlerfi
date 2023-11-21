"use client";
import { Flex } from "@/components/shared/flex";
import { Button, Typography } from "@mui/joy";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  });

  const navigateToFund = () => {
    setButtonLoading(true);
    router.push("/onboarding/fund");
  };

  return (
    <Flex y grow gap2 component={"main"} px={4} py={2}>
      <Typography level="h3">Generating your builder.fi wallet</Typography>
      <Flex y mb={4} mt={2} gap2>
        <Typography level="body-md" mb={12}>
          You'll have your own wallet address within builder.fi. You'll be able to deposit and withdraw ETH in Base and
          to make the experience of trading keys very smooth!
        </Typography>
        {isLoading ? (
          <CircularProgress style={{ marginLeft: "auto", marginRight: "auto" }} />
        ) : (
          <Button loading={buttonLoading} onClick={() => navigateToFund()}>
            Fund wallet
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
