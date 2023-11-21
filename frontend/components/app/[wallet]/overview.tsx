"use client";
import { Flex } from "@/components/shared/flex";
import { WalletAddress } from "@/components/shared/wallet-address";
import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { SocialData } from "@/hooks/useSocialData";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { formatEth } from "@/lib/utils";
import { KeyOutlined, Refresh } from "@mui/icons-material";
import { Avatar, Box, Button, IconButton, Link as JoyLink, Skeleton, Typography } from "@mui/joy";
import { SocialProfileType } from "@prisma/client";
import Image from "next/image";
import { FC } from "react";
import { toast } from "react-toastify";

interface Props {
  socialData: SocialData;
  isOwnProfile: boolean;
  setBuyModalState: (state: "closed" | "buy" | "sell") => void;
}

const socialInfo = {
  [SocialProfileType.LENS]: {
    name: "Lens",
    icon: <Image width={20} height={20} src={LENS_LOGO} alt="Lens logo" />,
    url: (username: string) => `https://hey.xyz/u/${username.replace("lens/@", "")}`
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

export const Overview: FC<Props> = ({ socialData, isOwnProfile, setBuyModalState }) => {
  const { refetch } = useUserContext();
  const { hasKeys, holders, ownedKeysCount, supporterNumber } = useProfileContext();

  const { buyPrice, isLoading, supply } = useGetBuilderInfo(socialData.address);
  const refreshData = useRefreshCurrentUser();

  const keysPlural = () => {
    if (ownedKeysCount != 0) {
      return "keys";
    } else {
      return "key";
    }
  };
  return (
    <>
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
                disabled={(supply || 0) <= BigInt(1)}
              >
                Sell
              </Button>
            )}

            <Button
              sx={{ alignSelf: "flex-start" }}
              onClick={() => setBuyModalState("buy")}
              disabled={supply === BigInt(0) && !isOwnProfile}
            >
              {isOwnProfile && holders?.length === 0 ? "Create keys" : "Buy"}
            </Button>
          </Flex>
        </Flex>
        <Flex x yc gap1>
          <Flex y>
            <Flex x yc>
              {socialData.hasDisplayName ? (
                <Typography level="h3">
                  <Skeleton loading={socialData.isLoading}>{socialData.name}</Skeleton>
                </Typography>
              ) : (
                <WalletAddress address={socialData.address} level="h3" removeCopyButton={!isOwnProfile} />
              )}
              {isOwnProfile && (
                <>
                  <IconButton
                    disabled={refreshData.isLoading}
                    onClick={() =>
                      refreshData
                        .mutateAsync()
                        .then(() => refetch())
                        .then(() => toast.success("Profile refreshed"))
                    }
                  >
                    <Refresh />
                    <Typography level="body-sm">Refresh social data</Typography>
                  </IconButton>
                </>
              )}
            </Flex>
            {/* Only display if user has a display name */}
            <Flex x yc gap={0.5} height="20px">
              <Typography level="body-sm" startDecorator={<KeyOutlined fontSize="small" />}>
                <Skeleton loading={isLoading}>{formatEth(buyPrice)} ETH</Skeleton>
              </Typography>
              {socialData.hasDisplayName && (
                <>
                  •
                  <WalletAddress address={socialData.address} level="body-sm" removeCopyButton={!isOwnProfile} />
                </>
              )}
            </Flex>
          </Flex>
        </Flex>

        <Flex x gap2 flexWrap={"wrap"}>
          {socialData.socialsList.map(social => {
            const additionalData = socialInfo[social.dappName as keyof typeof socialInfo];
            return (
              <JoyLink
                key={social.dappName}
                href={additionalData.url(social.profileName, socialData.socialAddress || "")}
                target="_blank"
                startDecorator={additionalData.icon}
                textColor={"link"}
              >
                {social.profileName}
              </JoyLink>
            );
          })}
        </Flex>

        {ownedKeysCount === 0 ? (
          <Typography level="body-sm">You don&apos;t own any keys</Typography>
        ) : (
          <Flex x gap2>
            <Typography level="body-sm">
              Holder{" "}
              <Box fontWeight={600} component="span">
                {`#${supporterNumber}`}
              </Box>
            </Typography>
            <Typography level="body-sm">
              You own{" "}
              <Box fontWeight={600} component="span">
                {ownedKeysCount?.toString()} {keysPlural()}
              </Box>
            </Typography>
          </Flex>
        )}
      </Flex>
    </>
  );
};
