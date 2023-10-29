"use client";

import { Flex } from "@/components/shared/flex";
import { LOGO } from "@/lib/assets";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

export default function Signup() {
  const { login } = usePrivy();

  return (
    <Flex y ysb xc height="300px">
      <Flex y xc gap2>
        <Image alt="App logo" src={LOGO} height={40} width={150} />
        <Typography level="body-sm" textColor="neutral.500">
          Monetize Your Knowledge
        </Typography>
      </Flex>

      <Flex y xc gap3>
        <Button size="lg" onClick={() => login()}>
          Sign in
        </Button>
      </Flex>
    </Flex>
  );
}
