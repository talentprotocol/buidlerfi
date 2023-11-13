"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useLinkWallet } from "@/hooks/useUserApi";
import { DEFAULT_PROFILE_PICTURE, EXAMPLE_PROFILE_PICTURE } from "@/lib/assets";
import { formatError, shortAddress } from "@/lib/utils";
import { ArrowRight } from "@mui/icons-material";
import { Avatar, Button, Typography } from "@mui/joy";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "react-toastify";

export default function CreateWallet() {
  const router = useRouter();
  const { refetch } = useUserContext();
  const { linkWallet } = usePrivy();
  const { wallets } = useWallets();
  const { user } = useUserContext();

  const { mutateAsync: linkNewWallet, isLoading } = useLinkWallet();

  const linkedWallet = useMemo(() => wallets.find(wal => wal.connectorType !== "embedded"), [wallets]);
  console.log(wallets);
  //We use useQuery to ensure function is executed only once, and only when a wallet is found.
  const {} = useQuery(
    ["linkNewWallet", linkedWallet?.address],
    () => {
      return linkNewWallet(linkedWallet!.address)
        .catch(err => toast.error(formatError(err)))
        .then(() => refetch());
    },
    { enabled: !!linkedWallet?.address }
  );

  const handleLinkWallet = () => {
    linkWallet();
  };

  return (
    <Flex y ysb height={"350px"}>
      <Flex y gap1>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          BuilderFI is better with friends.
        </Typography>
        <Typography level="body-sm" mt={1}>
          A wallet has been generated for you by BuilderFI. However, you can still link your main wallet to display your
          Lens or Farcaster profile and get recommendations.
        </Typography>
      </Flex>
      <Flex x yc px={4}>
        {user && (
          <Flex x yc grow xs gap2 basis="40%">
            <Avatar size="lg" src={DEFAULT_PROFILE_PICTURE} />
            <Flex y gap={0.5}>
              <Typography level="title-md">{shortAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}</Typography>
            </Flex>
          </Flex>
        )}
        <ArrowRight />
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
        <Button loading={isLoading} onClick={handleLinkWallet}>
          Link your wallet
        </Button>
        <Button disabled={isLoading} variant="plain" onClick={() => router.push("/onboarding/fund?skiplink=1")}>
          Skip
        </Button>
      </Flex>
    </Flex>
  );
}
