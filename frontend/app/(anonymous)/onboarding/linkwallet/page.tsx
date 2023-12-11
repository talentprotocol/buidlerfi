"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { WEB3_SOCIALS_IMAGE } from "@/lib/assets";
import { Button, Typography } from "@mui/joy";

export default function CreateWallet() {
  const router = useBetterRouter();
  const { refetch } = useUserContext();
  const { linkWallet, isLoading } = useLinkExternalWallet();

  const handleLinkWallet = () => {
    linkWallet(async () => {
      await refetch();
    });
  };

  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex y>
          <Typography my={1} level="h3">
            Import your web3 socials
          </Typography>
          <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
            Connect your main web3 wallet to verify your onchain identity and import your profile info. This also makes
            it easier for your Farcaster, Lens and Talent Protocol friends to discover and trade your keys.
          </Typography>
        </Flex>
      </Flex>
      <Flex y yc xc grow>
        <img src={WEB3_SOCIALS_IMAGE} width="100%" />
      </Flex>
      <Flex y gap1>
        <Button size="lg" fullWidth loading={isLoading} onClick={() => handleLinkWallet()}>
          Connect web3 socials
        </Button>
        <Button
          size="lg"
          fullWidth
          variant="plain"
          disabled={isLoading}
          onClick={() => router.push({ searchParams: { skiplink: "1" } }, { preserveSearchParams: true })}
        >
          Connect later
        </Button>
      </Flex>
    </Flex>
  );
}
