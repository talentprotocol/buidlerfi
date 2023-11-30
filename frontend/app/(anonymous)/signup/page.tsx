"use client";

import { Flex } from "@/components/shared/flex";
import { INSTALL_PWA_IMAGE, LOGO_BLUE_BACK, LOGO_WITH_SHADOW, SIGN_IN_IMAGE } from "@/lib/assets";
import { FAQ_LINK } from "@/lib/constants";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

interface Navigator extends globalThis.Navigator {
  standalone?: boolean;
}

export default function Signup() {
  const { login } = usePrivy();
  const [isInstalled, setIsInstalled] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (skip) return;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const { standalone } = navigator as Navigator;
    if (document.referrer.startsWith("android-app://")) {
      setIsInstalled(true);
      setSkip(true);
    } else if (standalone || isStandalone) {
      setIsInstalled(true);
      setSkip(true);
    }
    setIsInstalled(false);
  }, []);

  if (!skip && !isInstalled) {
    return (
      <Flex y yc grow>
        <Flex y grow yc>
          <Flex y yc xc pt={3} height="587px">
            <Flex y xc gap2>
              <img alt="App logo" src={LOGO_WITH_SHADOW} />
            </Flex>
            <Flex y mt={1} xc grow>
              <Typography level="h3">Add to home screen</Typography>
              <Typography textColor="neutral.600" level="body-md" mb={3}>
                Install the app to get the best experience
              </Typography>
              <img src={INSTALL_PWA_IMAGE} width="100%" />
            </Flex>
          </Flex>
        </Flex>
        <Flex y ye xc p={2}>
          <Button fullWidth size="lg" variant="plain" onClick={() => setSkip(true)}>
            Continue on web
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex y ysb grow fullwidth p={2}>
      <Typography mb={3} level="body-sm" startDecorator={<img src={LOGO_BLUE_BACK} />}>
        Welcome to builder.fi
      </Typography>
      <Typography level="h2">
        Monetize your
        <br />
        knowledge, support
        <br />
        the next builders.
      </Typography>
      <Flex grow>
        <img src={SIGN_IN_IMAGE} width="100%" />
      </Flex>
      <Flex y gap1>
        <Typography textAlign="center" textColor="neutral.600" level="body-md" my={2}>
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
