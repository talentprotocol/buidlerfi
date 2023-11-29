"use client";
import { Flex } from "@/components/shared/flex";
import { WalletAddress } from "@/components/shared/wallet-address";
import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { formatEth } from "@/lib/utils";
import { KeyOutlined } from "@mui/icons-material";
import { Avatar, Box, Button, Link as JoyLink, Skeleton, Typography } from "@mui/joy";
import { SocialProfileType } from "@prisma/client";
import Image from "next/image";
import { FC } from "react";
import { toast } from "react-toastify";

interface Props {
  setBuyModalState: (state: "closed" | "buy" | "sell") => void;
}

const socialInfo = {
  [SocialProfileType.TALENT_PROTOCOL]: {
    name: "Talent Protocol",
    icon: <Image width={20} height={20} src={TALENT_PROTOCOL_LOGO} alt="Talent Protocol logo" />,
    url: (_: string, address: string) => `https://beta.talentprotocol.com/u/${address}`
  },
  [SocialProfileType.FARCASTER]: {
    name: "Farcaster",
    icon: <Image width={20} height={20} src={FARCASTER_LOGO} alt="Farcaster logo" />,
    url: (username: string) => `https://warpcast.com/${username}`
  },
  [SocialProfileType.LENS]: {
    name: "Lens",
    icon: <Image width={20} height={20} src={LENS_LOGO} alt="Lens logo" />,
    url: (username: string) => `https://hey.xyz/u/${username.replace("lens/@", "")}`
  },
  [SocialProfileType.ENS]: {
    name: "ENS",
    icon: <Image width={20} height={20} src={ENS_LOGO} alt="Ens logo" />,
    url: (username: string) => `https://app.ens.domains/${username}`
  }
};
const socialsOrder = Object.keys(socialInfo);

export const Overview: FC<Props> = ({ setBuyModalState }) => {
  const { refetch, user } = useUserContext();
  const { hasKeys, holders, ownedKeysCount, supporterNumber, isOwnProfile, socialData } = useProfileContext();

  const refetchAll = async () => {
    await refetch();
    await socialData.refetch();
  };

  const { linkWallet } = useLinkExternalWallet();

  const { buyPrice, isLoading, supply } = useGetBuilderInfo(socialData.wallet);
  const refreshData = useRefreshCurrentUser();

  const handleLinkOrRefreshWallet = async () => {
    if (user?.socialWallet) {
      await refreshData.mutateAsync();
      await refetchAll();
      toast.success("Profile info imported from Talent Protocol/Farcaster/Lens/ENS");
    } else {
      linkWallet(refetchAll);
    }
  };

  const keysPlural = () => {
    if (ownedKeysCount != 1) {
      return "keys";
    } else {
      return "key";
    }
  };

  return (
    <>
      <Flex y gap2 p={2}>
        <Flex x xsb mb={-1}>
          <Avatar size="lg" src={socialData.avatarUrl}>
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
          <Flex y fullwidth>
            {socialData.hasDisplayName ? (
              <Typography level="h3">
                <Skeleton loading={socialData.isLoading}>{socialData.displayName}</Skeleton>
              </Typography>
            ) : (
              <WalletAddress address={socialData.wallet} level="h3" removeCopyButton={!isOwnProfile} />
            )}
            {/* Only display if user has a display name */}
            <Flex x yc gap={0.5} height="20px">
              <Typography level="body-sm" startDecorator={<KeyOutlined fontSize="small" />}>
                <Skeleton loading={isLoading}>{formatEth(buyPrice)} ETH</Skeleton>
              </Typography>
              {socialData.hasDisplayName && (
                <>
                  •
                  <WalletAddress address={socialData.wallet} level="body-sm" removeCopyButton={!isOwnProfile} />
                </>
              )}
            </Flex>
          </Flex>
        </Flex>

        {isOwnProfile && (
          <Button
            sx={{ alignSelf: "flex-start" }}
            variant="soft"
            loading={!!user?.socialWallet && refreshData.isLoading}
            onClick={handleLinkOrRefreshWallet}
          >
            <Typography level="body-sm">
              {user?.socialWallet ? "Refresh social data" : "Import web3 socials"}
            </Typography>
          </Button>
        )}

        <Flex x gap2 flexWrap={"wrap"}>
          {socialData.socialsList
            .sort((a, b) => {
              return socialsOrder.indexOf(a.dappName) - socialsOrder.indexOf(b.dappName);
            })
            .map(social => {
              const additionalData = socialInfo[social.dappName as keyof typeof socialInfo];
              return (
                <JoyLink
                  key={social.dappName}
                  href={additionalData.url(social.profileName, socialData.socialAddress || "")}
                  target="_blank"
                  textColor={"link"}
                >
                  {additionalData.icon}
                </JoyLink>
              );
            })}
        </Flex>

        {ownedKeysCount === 0 ? (
          <Typography level="body-sm">
            {socialData.userId ? "You don't own any keys" : `${socialData.displayName} is not on builder.fi yet`}
          </Typography>
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
