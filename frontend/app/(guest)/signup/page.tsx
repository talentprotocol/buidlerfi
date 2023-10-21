"use client";

import { Flex } from "@/components/shared/flex";
import { LOGO } from "@/lib/assets";
import { Button, Typography } from "@mui/joy";
import Image from "next/image";

export default function Signup() {
  const handleSignin = () => {
    //Add privy flow here
    //And create user in DB
  };

  return (
    <Flex y yc xc grow>
      <Flex y ysb xc height="300px">
        <Flex y xc gap3>
          <Image alt="App logo" src={LOGO} height={40} width={150} />
          <Typography level="body-sm" textColor="neutral.500">
            Monetize your alpha and network
          </Typography>
        </Flex>

        <Flex y xc gap3>
          <Button size="lg" onClick={() => handleSignin}>
            Sign in
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
