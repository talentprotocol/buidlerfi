"use client";
import { Flex } from "@/components/shared/flex";
import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { SocialData } from "@/hooks/useSocialData";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { BASE_GOERLI_TESTNET } from "@/lib/constants";
import { formatEth, shortAddress } from "@/lib/utils";
import { ContentCopy, KeyOutlined, Refresh } from "@mui/icons-material";
import { Avatar, Box, Button, IconButton, Link as JoyLink, Skeleton, Typography } from "@mui/joy";
import { SocialProfileType } from "@prisma/client";
import Image from "next/image";
import { FC, useCallback, useMemo, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { BuyShareModal } from "./buy-share-modal";

interface Props {
  socialData: SocialData;
  isOwnProfile: boolean;
}

const socialInfo = {
  [SocialProfileType.LENS]: {
    name: "Lens",
    icon: <Image width={20} height={20} src={LENS_LOGO} alt="Lens logo" />,
    url: (username: string) => `https://hey.xyz/u/${username}`
  },
  [SocialProfileType.FARCASTER]: {
    name: "Farcaster",
    icon: <Image width={20} height={20} src={FARCASTER_LOGO} alt="Farcaster logo" />,
    url: (username: string) => `https://warpcast.com/${username}`
  },
  [SocialProfileType.TALENT_PROTOCOL]: {
    name: "Talent Protocol",
    icon: <Image width={20} height={20} src={TALENT_PROTOCOL_LOGO} alt="Talent Protocol logo" />,
    url: (_: string, address: string) => `https://beta.talentprotocol.com/u/${address}`
  },
  [SocialProfileType.ENS]: {
    name: "ENS",
    icon: <Image width={20} height={20} src={ENS_LOGO} alt="Ens logo" />,
    url: (username: string) => `https://app.ens.domains/${username}`
  }
};

export const Overview: FC<Props> = ({ socialData, isOwnProfile }) => {
  const { address } = useAccount();
  const [openBuy, setOpenBuy] = useState(false);

  const holders = useGetHolders(socialData?.address);
  const supporterNumber = useMemo(() => {
    if (!holders?.data) return undefined;

    const holder = holders.data.find(holder => holder.holder.owner.toLowerCase() === address?.toLowerCase());
    if (!holder) return undefined;

    return Number(holder.supporterNumber);
  }, [address, holders.data]);

  const { data: totalSupply, refetch: refetchTotalSupply } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "builderCardsSupply",
    args: [socialData.address]
  });

  const {
    data: buyPrice,
    isLoading: isLoadingBuyPrice,
    refetch: refetchBuyPrice
  } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "getBuyPrice",
    args: [socialData.address]
  });

  const { data: sellPrice, refetch: refetchSellprice } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "getSellPrice",
    args: [socialData.address, BigInt(1)]
  });

  const { data: supporterKeys, refetch: refetchKeys } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "builderCardsBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const refetchAll = useCallback(async () => {
    refetchTotalSupply();
    refetchBuyPrice();
    refetchSellprice();
    refetchKeys();
  }, [refetchBuyPrice, refetchKeys, refetchSellprice, refetchTotalSupply]);

  const refreshData = useRefreshCurrentUser();

  const hasKeys = useMemo(() => !!supporterKeys && supporterKeys > 0, [supporterKeys]);
  return (
    <>
      <BuyShareModal
        open={openBuy}
        socialData={socialData}
        supporterKeysCount={supporterKeys}
        hasKeys={hasKeys}
        buyPrice={buyPrice}
        sellPrice={sellPrice}
        close={() => {
          refetchAll();
          setOpenBuy(false);
        }}
      />

      <Flex y gap2 p={2}>
        <Flex x yc gap1>
          <Avatar size="lg" src={socialData.avatar} />
          <Flex y>
            <Flex x yc>
              <Typography level="h3" className="font-bold">
                {socialData.name}
              </Typography>
              {shortAddress(socialData.address) === socialData.name && (
                <IconButton size="sm" onClick={() => window.navigator.clipboard.writeText(socialData.address)}>
                  <ContentCopy sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              )}
              {isOwnProfile && (
                <IconButton onClick={() => refreshData.mutate()}>
                  <Refresh />
                </IconButton>
              )}
            </Flex>
            {/* Only display if user has a display name */}
            {shortAddress(socialData.address) !== socialData.name && (
              <Flex x yc gap={0.5} height="20px">
                <Typography level="body-sm" textColor="neutral.600">
                  {shortAddress(socialData.address)}
                </Typography>
                <IconButton size="sm" onClick={() => window.navigator.clipboard.writeText(socialData.address)}>
                  <ContentCopy sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex y gap1>
          <Typography level="body-sm" startDecorator={<KeyOutlined fontSize="small" />}>
            <Skeleton loading={isLoadingBuyPrice}>{formatEth(buyPrice)}</Skeleton>
          </Typography>
          {socialData.socialsList.map(social => {
            const additionalData = socialInfo[social.dappName as keyof typeof socialInfo];
            return (
              <JoyLink
                key={social.dappName}
                href={additionalData.url(social.profileName, socialData.address)}
                target="_blank"
                startDecorator={additionalData.icon}
                textColor={"link"}
              >
                {social.profileName}
              </JoyLink>
            );
          })}
        </Flex>

        {supporterNumber === undefined ? (
          <Typography level="body-sm">You don&apos;t own any keys</Typography>
        ) : (
          <Flex x gap2>
            <Typography level="body-sm">
              Holder{" "}
              <Box fontWeight={600} component="span">
                {supporterNumber}/{totalSupply?.toString()}
              </Box>
            </Typography>
            <Typography level="body-sm">
              You own{" "}
              <Box fontWeight={600} component="span">
                {supporterKeys?.toString()} key
              </Box>
            </Typography>
          </Flex>
        )}
        <Button
          sx={{ alignSelf: "flex-start" }}
          onClick={() => setOpenBuy(true)}
          disabled={totalSupply === BigInt(0) && !isOwnProfile}
        >
          {hasKeys ? "Trade" : "Buy"}
        </Button>
      </Flex>
    </>
  );
};
