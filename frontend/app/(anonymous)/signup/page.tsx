"use client";

import { Flex } from "@/components/shared/flex";
import { LOGO } from "@/lib/assets";
import { FAQ_LINK, TWITTER_LINK } from "@/lib/constants";
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
          Monetize your knowledge,
          <br />
          support the next builders.
        </Typography>
      </Flex>

      <Flex y xc mt={4}>
        <Button size="lg" onClick={() => login()}>
          Sign in
        </Button>
        <Typography level="body-sm" textColor="neutral.500" mt={4}>
          Check out our{" "}
          <a target="_blank" href={FAQ_LINK}>
            FAQ
          </a>
        </Typography>
        <Typography level="body-sm" textColor="neutral.500" mt={1}>
          Follow us on{" "}
          <a target="_blank" href={TWITTER_LINK}>
            Twitter
          </a>
        </Typography>
      </Flex>
    </Flex>
  );
}
