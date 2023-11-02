"use client";
import { Flex } from "@/components/shared/flex";
import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { SocialData } from "@/hooks/useSocialData";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { formatEth, shortAddress } from "@/lib/utils";
import { ContentCopy, KeyOutlined, Refresh } from "@mui/icons-material";
import { Avatar, Box, Button, IconButton, Link as JoyLink, Skeleton, Typography } from "@mui/joy";
import { SocialProfileType } from "@prisma/client";
import Image from "next/image";
import { FC, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { TradeKeyModal } from "./trade-key-modal";

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
  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");

  const holders = useGetHolders(socialData?.address);
  const [supporterNumber, ownedKeysCount] = useMemo(() => {
    if (!holders?.data) return [undefined, undefined];

    const holder = holders.data.find(holder => holder.holder.owner.toLowerCase() === address?.toLowerCase());
    if (!holder) return [undefined, 0];
    else return [holder.supporterNumber, Number(holder.heldKeyNumber)];
  }, [address, holders.data]);

  const { buyPrice, sellPrice, refetch, isLoading, supply, buyPriceAfterFee } = useGetBuilderInfo(socialData.address);

  const refreshData = useRefreshCurrentUser();

  const hasKeys = useMemo(() => !!ownedKeysCount && ownedKeysCount > 0, [ownedKeysCount]);
  return (
    <>
      {buyModalState !== "closed" && (
        <TradeKeyModal
          socialData={socialData}
          supporterKeysCount={ownedKeysCount || 0}
          hasKeys={hasKeys}
          buyPrice={buyPrice}
          sellPrice={sellPrice}
          buyPriceWithFees={buyPriceAfterFee}
          side={buyModalState}
          close={() => {
            refetch();
            setBuyModalState("closed");
          }}
        />
      )}

      <Flex y gap2 p={2}>
        <Flex x xsb mb={-1}>
          <Avatar size="lg" src={socialData.avatar}>
            <Skeleton loading={socialData.isLoading} />
          </Avatar>
          <Flex x yc gap1>
            {hasKeys && (
              <Button
                variant="outlined"
                color="neutral"
                sx={{ alignSelf: "flex-start" }}
                onClick={() => setBuyModalState("sell")}
                disabled={supply === BigInt(0) && !isOwnProfile}
              >
                Sell
              </Button>
            )}

            <Button
              sx={{ alignSelf: "flex-start" }}
              onClick={() => setBuyModalState("buy")}
              disabled={supply === BigInt(0) && !isOwnProfile}
            >
              {isOwnProfile && holders.data?.length === 0 ? "Create keys" : "Buy"}
            </Button>
          </Flex>
        </Flex>
        <Flex x yc gap1>
          <Flex y>
            <Flex x yc>
              <Typography level="h3" className="font-bold">
                <Skeleton loading={socialData.isLoading}>{socialData.name}</Skeleton>
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
            <Skeleton loading={isLoading}>{formatEth(buyPrice)}</Skeleton>
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
                {supporterNumber}/{supply?.toString()}
              </Box>
            </Typography>
            <Typography level="body-sm">
              You own{" "}
              <Box fontWeight={600} component="span">
                {ownedKeysCount?.toString()} key
              </Box>
            </Typography>
          </Flex>
        )}
      </Flex>
    </>
  );
};
