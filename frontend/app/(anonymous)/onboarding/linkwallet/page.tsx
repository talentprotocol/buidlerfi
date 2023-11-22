"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { useUpdateUser } from "@/hooks/useUserApi";
import { DEFAULT_PROFILE_PICTURE, EXAMPLE_PROFILE_PICTURE } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { ArrowDownward } from "@mui/icons-material";
import { Avatar, Button, Typography } from "@mui/joy";
import { useMutation } from "@tanstack/react-query";

export default function CreateWallet() {
  const router = useBetterRouter();
  const { user, refetch } = useUserContext();
  const { isLoading, linkWallet } = useLinkExternalWallet();

  const updateUser = useUpdateUser();

  const finishOnboarding = useMutation(async () => {
    await linkWallet();
    await updateUser.mutateAsync({ hasFinishedOnboarding: true });
    await refetch();
    router.replace("/home");
  });

  return (
    <Flex y ysb>
      <Flex y gap1>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Link your web3 socials
        </Typography>
        <Typography level="body-sm" mt={1}>
          Connect your main web3 wallet to verify your onchain identity and import your profile info. This also makes it
          easier for your Farcaster and Lens friends to discover and trade your keys.
        </Typography>
      </Flex>
      <Flex y yc xc py={4} gap2>
        {user && (
          <Flex x yc grow xs gap2 basis="40%">
            <Avatar size="lg" src={DEFAULT_PROFILE_PICTURE} />
            <Flex y gap={0.5}>
              <Typography level="body-sm">{shortAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}</Typography>
            </Flex>
          </Flex>
        )}
        <ArrowDownward />
        {user && (
          <Flex x yc grow xe gap2 basis="40%">
            <Avatar size="lg" src={EXAMPLE_PROFILE_PICTURE} />
            <Flex y yc height="20px">
              <Typography level="title-md">Vitalik</Typography>
              <Typography level="body-sm" textColor="neutral.600">
                {shortAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}
              </Typography>
            </Flex>
          </Flex>
        )}
      </Flex>

      <Flex y gap1>
        <Button loading={isLoading} onClick={() => finishOnboarding.mutate()}>
          connect web3 social
        </Button>
        <Button
          variant="plain"
          onClick={() => router.push({ searchParams: { skiplink: "1" } }, { preserveSearchParams: true })}
        >
          Skip
        </Button>
      </Flex>
    </Flex>
  );
}
