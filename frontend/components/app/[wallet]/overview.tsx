"use client";
import { EthIcon } from "@/components/icons/ethIcon";
import { Flex } from "@/components/shared/flex";
import { WalletAddress } from "@/components/shared/wallet-address";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ENS_LOGO, FARCASTER_LOGO, LENS_LOGO, TALENT_PROTOCOL_LOGO } from "@/lib/assets";
import { formatEth, shortAddress } from "@/lib/utils";
import { EditOutlined } from "@mui/icons-material";
import { Avatar, Button, Chip, Link as JoyLink, Skeleton, Typography } from "@mui/joy";
import { SocialProfileType } from "@prisma/client";
import Image from "next/image";
import { FC, useMemo } from "react";

interface Props {
  setBuyModalState: (state: "closed" | "buy" | "sell") => void;
  profile: ReturnType<typeof useUserProfile>;
}

export const socialInfo = {
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
export const socialsOrder = Object.keys(socialInfo);

export const Overview: FC<Props> = ({ setBuyModalState, profile }) => {
  const { user: currentUser } = useUserContext();

  const router = useBetterRouter();

  const { buyPrice, supply } = useGetBuilderInfo(profile.user?.wallet);
  const refreshData = useRefreshCurrentUser();

  const keysPlural = () => {
    if (profile.ownedKeysCount != 1) {
      return "keys";
    } else {
      return "key";
    }
  };

  const avatarUrl = useMemo(() => {
    return profile.user?.avatarUrl || profile.recommendedUser?.avatarUrl || "";
  }, [profile.user, profile.recommendedUser]);

  const recommendedName = () =>
    profile.recommendedUser?.talentProtocol ||
    profile.recommendedUser?.farcaster ||
    profile.recommendedUser?.lens ||
    profile.recommendedUser?.ens ||
    shortAddress(profile.recommendedUser?.wallet || "");

  const name = useMemo(() => profile.user?.displayName || recommendedName(), [profile.user, profile.recommendedUser]);

  const allSocials = useMemo(() => {
    if (profile.user?.socialProfiles?.length) {
      return profile.user?.socialProfiles;
    } else {
      const otherSocials = [];

      if (profile.recommendedUser?.talentProtocol) {
        otherSocials.push({
          type: SocialProfileType.TALENT_PROTOCOL,
          profileName: profile.recommendedUser.talentProtocol,
          socialAddress: profile.recommendedUser.wallet
        });
      }
      if (profile.recommendedUser?.farcaster) {
        otherSocials.push({
          type: SocialProfileType.FARCASTER,
          profileName: profile.recommendedUser.farcaster
        });
      }
      if (profile.recommendedUser?.lens) {
        otherSocials.push({
          type: SocialProfileType.LENS,
          profileName: profile.recommendedUser.lens
        });
      }
      if (profile.recommendedUser?.ens) {
        otherSocials.push({
          type: SocialProfileType.ENS,
          profileName: profile.recommendedUser.ens
        });
      }
      return otherSocials;
    }
  }, [profile.user, profile.recommendedUser]);

  return (
    <>
      <Flex y gap2 p={2}>
        <Skeleton variant="circular" width={80} height={80} loading={profile.isLoading}>
          <Flex x xsb mb={-1}>
            <Avatar size="lg" sx={{ height: "80px", width: "80px" }} src={avatarUrl} alt={name}></Avatar>
            <Flex x ys gap1>
              {profile.isOwnProfile && (
                <Button
                  sx={{ width: "36px", height: "36px" }}
                  variant="outlined"
                  color="neutral"
                  loading={!!currentUser?.socialWallet && refreshData.isLoading}
                  onClick={() => router.push("./edit")}
                >
                  <EditOutlined />
                </Button>
              )}
              {profile.hasKeys && (
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setBuyModalState("sell")}
                  disabled={(supply || 0) <= BigInt(1)}
                >
                  Sell
                </Button>
              )}

              <Button onClick={() => setBuyModalState("buy")} disabled={supply === BigInt(0) && !profile.isOwnProfile}>
                {profile.isOwnProfile && profile.holders?.length === 0 ? "Create keys" : "Buy"}
              </Button>
            </Flex>
          </Flex>
          <Flex x yc gap1>
            <Flex y fullwidth>
              {!!name ? (
                <Typography level="h2">{name}</Typography>
              ) : (
                <WalletAddress
                  address={profile.user?.wallet || profile.recommendedUser?.wallet || ""}
                  level="h3"
                  removeCopyButton={!profile.isOwnProfile}
                />
              )}
              {/* Only display if user has a display name */}
              <Flex x yc gap={0.5} height="20px">
                <Typography level="title-sm" startDecorator={<EthIcon size="sm" />}>
                  {formatEth(buyPrice)}
                </Typography>
                {profile.ownedKeysCount > 0 && (
                  <Typography level="body-sm">
                    • You own {profile.ownedKeysCount?.toString()} {keysPlural()}
                  </Typography>
                )}
              </Flex>
            </Flex>
          </Flex>

          {profile.user?.bio && <Typography level="body-sm">{profile.user.bio}</Typography>}
          {profile.user?.tags && profile.user?.tags.length > 0 && (
            <Flex x yc gap1>
              {profile.user.tags.map(tag => (
                <Chip variant="outlined" color="neutral" key={tag.id}>
                  {tag.name}
                </Chip>
              ))}
            </Flex>
          )}

          {profile.ownedKeysCount === 0 && !profile.user ? (
            <Typography level="body-sm">{`${name} is not on builder.fi yet`}</Typography>
          ) : (
            <Flex x gap2 pointer onClick={() => router.push("./holders")}>
              <Typography level="body-sm">
                <strong>{profile.holders?.length}</strong> holders
              </Typography>
              <Typography level="body-sm">
                <strong>{profile.holdings?.length}</strong> holding
              </Typography>
            </Flex>
          )}

          <Flex x gap2 flexWrap={"wrap"}>
            {allSocials
              .sort((a, b) => {
                return socialsOrder.indexOf(a.type) - socialsOrder.indexOf(b.type);
              })
              .map(social => {
                const additionalData = socialInfo[social.type as keyof typeof socialInfo];
                return (
                  <JoyLink
                    key={social.type}
                    href={additionalData.url(
                      social.profileName,
                      profile.user?.socialWallet || profile.recommendedUser?.wallet || ""
                    )}
                    target="_blank"
                    textColor={"link"}
                    variant="outlined"
                    color="neutral"
                    p={1}
                    sx={{ borderRadius: "50%" }}
                  >
                    {additionalData.icon}
                  </JoyLink>
                );
              })}
          </Flex>
        </Skeleton>
      </Flex>
    </>
  );
};
