"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { WEB3_SOCIALS_IMAGE } from "@/lib/assets";
import { BUILDERFI_CONTRACT } from "@/lib/constants";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";
import { Button, IconButton, Typography } from "@mui/joy";
import { useContractRead } from "wagmi";

export default function CreateWallet() {
  const router = useBetterRouter();
  const user = useUserContext();
  const { refetch } = useUserContext();
  const { linkWallet, isLoading } = useLinkExternalWallet();

  const handleLinkWallet = () => {
    linkWallet(async () => {
      await refetch();
    });
  };

  const { data: supporterKeys } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "builderKeysBalance",
    args: [user.user?.wallet as `0x${string}`, user.user?.wallet as `0x${string}`],
    enabled: !!user.user?.wallet
  });

  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex x xsb yc>
          <Flex basis="100%">
            {Number(supporterKeys) === 0 && router.searchParams.skipLaunchingKeys === "1" && (
              <IconButton sx={{ textAlign: "start" }}>
                <ArrowBackIosNewOutlined
                  onClick={() =>
                    router.push({ searchParams: { skipLaunchingKeys: undefined } }, { preserveSearchParams: true })
                  }
                />
              </IconButton>
            )}
          </Flex>
          <Typography textAlign="center" level="body-sm" textColor="neutral.800" flexBasis={"100%"}>
            Verify account
          </Typography>
          <Flex basis="100%" />
        </Flex>
        <Flex y>
          <Typography my={1} level="h3">
            Link your web3 socials
          </Typography>
          <Typography level="body-md" textColor="neutral.600">
            Connect your main web3 wallet to verify your onchain identity and import your profile info. This also makes
            it easier for your Farcaster and Lens friends to discover and trade your keys.
          </Typography>
        </Flex>
      </Flex>
      <Flex y yc xc grow>
        <img src={WEB3_SOCIALS_IMAGE} width="100%" />
      </Flex>
      <Flex y gap1>
        <Button size="lg" fullWidth loading={isLoading} onClick={() => handleLinkWallet()}>
          Connect wallet to verify account
        </Button>
        <Button
          size="lg"
          fullWidth
          variant="plain"
          disabled={isLoading}
          onClick={() => router.push({ searchParams: { skiplink: "1" } }, { preserveSearchParams: true })}
        >
          Continue as unverified guest
        </Button>
      </Flex>
    </Flex>
  );
}
