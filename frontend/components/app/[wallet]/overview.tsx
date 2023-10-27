"use client";
import { Flex } from "@/components/shared/flex";
import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { SocialData } from "@/hooks/useSocialData";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { BASE_GOERLI_TESTNET } from "@/lib/constants";
import { formatEth, shortAddress } from "@/lib/utils";
import { ContentCopy, Refresh } from "@mui/icons-material";
import { Avatar, Button, Chip, IconButton, Tooltip, Typography } from "@mui/joy";
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

  const { data: buyPrice, refetch: refetchBuyPrice } = useContractRead({
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

  const holderNumberText = () => {
    if (holders.isLoading || supporterKeys === undefined) return "...";

    if (totalSupply === BigInt(0) && isOwnProfile) {
      return "Your first card is free.";
    }

    if (supporterNumber === 0 && supporterKeys > 0) {
      return "You are holder #0";
    }
    if (supporterNumber && supporterNumber > 0) {
      return `You are holder #${supporterNumber}`;
    } else {
      return "You don't own any cards";
    }
  };

  const refreshData = useRefreshCurrentUser();

  const hasKeys = useMemo(() => !!supporterKeys && supporterKeys > 0, [supporterKeys]);
  return (
    <Flex y gap1 p={2}>
      <Flex x yc xsb>
        <Flex x yc gap2>
          <Avatar src={socialData.avatar} />
          <Flex y>
            <Flex x yc>
              <Typography level="h3" className="font-bold">
                {socialData.name}
              </Typography>
              {isOwnProfile && (
                <IconButton onClick={() => refreshData.mutate()}>
                  <Refresh />
                </IconButton>
              )}
            </Flex>
            {!socialData.name.startsWith("0x") && (
              <Flex x yc gap={0.5}>
                <Typography level="body-sm" textColor="neutral.400">
                  {shortAddress(socialData.address)}
                </Typography>
                <IconButton size="sm" onClick={() => window.navigator.clipboard.writeText(socialData.address)}>
                  <ContentCopy sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              </Flex>
            )}
          </Flex>
        </Flex>
        <div className="space-x-2">
          <Button onClick={() => setOpenBuy(true)} disabled={totalSupply === BigInt(0) && !isOwnProfile}>
            {hasKeys ? "Trade" : "Buy"}
          </Button>
        </div>
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
      </Flex>
      <Flex x yc xsb>
        <Flex y>
          <Typography className="text-base font-medium">{holderNumberText()}</Typography>
          <Flex x yc gap2>
            {/* <Typography level="body-sm" textColor={'neutral.400'}>
							{holders} holders
						</Typography>
						<Typography level="body-sm" textColor={'neutral.400'}>
							{holdings} holding
						</Typography> */}
            <Typography level="body-sm" textColor="neutral.400">
              {hasKeys ? `You own ${supporterKeys} cards` : "You don't own any cards"}
            </Typography>
          </Flex>
        </Flex>

        <Flex y>
          <Typography className="text-base font-medium">{formatEth(buyPrice)} ETH</Typography>
          <Typography level="body-sm" textColor="neutral.400">
            Card price
          </Typography>
        </Flex>
      </Flex>

      {socialData.socialsList.length > 0 && (
        <Flex x gap2 wrap>
          {socialData.socialsList.map(social => {
            const additionalData = socialInfo[social.dappName as keyof typeof socialInfo];
            return (
              <Tooltip key={social.dappName} title={additionalData.name} placement="top">
                <Chip
                  onClick={() => window.open(additionalData.url(social.profileName, socialData.address), "_blank")}
                  variant="outlined"
                  color="neutral"
                  size="lg"
                  startDecorator={additionalData.icon}
                >
                  {social.profileName}
                </Chip>
              </Tooltip>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};
