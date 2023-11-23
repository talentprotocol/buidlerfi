"use client";

import { Flex } from "@/components/shared/flex";
import { LOGO } from "@/lib/assets";
import { FAQ_LINK, TWITTER_LINK } from "@/lib/constants";
import { IosShare } from "@mui/icons-material";
import { Button, Card, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
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

      {!skip && !isInstalled ? (
        <>
          <Flex y mt={4} gap={2} component={Card} maxWidth={230}>
            <Typography level="body-sm" textColor="neutral.500">
              Add builder.fi to your home screen to get the best experience
            </Typography>
            <Flex x yc gap={2}>
              <Typography level="body-sm" textColor="neutral.500">
                1. Click the share button
              </Typography>
              <IosShare />
            </Flex>
            <Typography level="body-sm" textColor="neutral.500">
              2. Scroll down
            </Typography>
            <Typography level="body-sm" textColor="neutral.500">
              3. Click &quot;Add to Home Screen&quot;
            </Typography>
          </Flex>
          <Button variant="plain" sx={{ marginTop: 2 }} onClick={() => setSkip(true)}>
            Skip
          </Button>
        </>
      ) : (
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
      )}
    </Flex>
  );
}
