"use client";

import { Flex } from "@/components/shared/flex";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { INSTALL_PWA_IMAGE, LOGO_WITH_SHADOW } from "@/lib/assets";
import { Button, Typography } from "@mui/joy";

export default function InstallAppPage() {
  const router = useBetterRouter();
  return (
    <Flex y yc grow>
      <Flex y grow yc>
        <Flex y yc xc pt={3}>
          <Flex y xc gap2>
            <img alt="App logo" src={LOGO_WITH_SHADOW} />
          </Flex>
          <Flex y mt={1} xc grow>
            <Typography level="h3">Install the App</Typography>
            <Typography textColor="neutral.600" level="body-md" mb={3}>
              Add to homescreen to get the best experience
            </Typography>
            <img src={INSTALL_PWA_IMAGE} width="100%" />
          </Flex>
        </Flex>
      </Flex>
      <Flex y ye xc p={2}>
        <Button
          fullWidth
          size="lg"
          variant="plain"
          onClick={() => router.push({ searchParams: { skipInstall: "1" } }, { preserveSearchParams: true })}
        >
          Continue on web
        </Button>
      </Flex>
    </Flex>
  );
}
