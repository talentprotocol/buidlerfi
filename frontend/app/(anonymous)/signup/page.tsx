"use client";

import { Flex } from "@/components/shared/flex";
import { LOGO_BLUE_BACK, SIGN_IN_IMAGE } from "@/lib/assets";
import { FAQ_LINK } from "@/lib/constants";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";

export default function Signup() {
  const { login } = usePrivy();

  return (
    <Flex y ysb grow fullwidth p={2}>
      <Flex x yc xc>
        <Typography mb={3} level="body-sm" fontWeight="600" startDecorator={<img src={LOGO_BLUE_BACK} />}>
          Welcome to builder.fi
        </Typography>
      </Flex>
      <Typography level="h2">
        Monetize your
        <br />
        knowledge, support
        <br />
        the next builders
      </Typography>
      <Flex grow>
        <img src={SIGN_IN_IMAGE} width="100%" />
      </Flex>
      <Flex y gap1>
        <Typography textTransform="lowercase" textAlign="center" textColor="neutral.600" level="body-md" my={2}>
          Check our{" "}
          <a target="_blank" href={FAQ_LINK}>
            FAQ
          </a>
        </Typography>
        <Button fullWidth size="lg" onClick={() => login()}>
          Sign in
        </Button>
      </Flex>
    </Flex>
  );
}
