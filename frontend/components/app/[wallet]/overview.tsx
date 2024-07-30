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
import { NEW_BUILDERFI_INVITE_CAST } from "@/lib/constants";
import { encodeQueryData, formatEth, nFormatter, shortAddress } from "@/lib/utils";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Avatar from "@mui/joy/Avatar";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import JoyLink from "@mui/joy/Link";
import Skeleton from "@mui/joy/Skeleton";
import Typography from "@mui/joy/Typography";
import { SocialProfile, SocialProfileType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { FC, useMemo } from "react";

interface Props {
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

export const Overview: FC<Props> = ({ profile }) => {
  const { user: currentUser, isAuthenticatedAndActive } = useUserContext();
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

  const isCurrentUserProfilePage = currentUser?.wallet.toLowerCase() === profile.user?.wallet.toLowerCase();

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

  const followingAndHoldersIntersection = useMemo(() => {
    const currentUserFarcasterFollowings: SocialProfile[] =
      currentUser?.socialProfiles
        .find(s => s.type === SocialProfileType.FARCASTER)
        ?.followings?.map(f => f.following) || [];
    const profileHolders: SocialProfile[] =
      (profile.holders
        ?.filter(h => h.holderId !== profile.user?.id)
        .map(h => h.holder.socialProfiles?.find(s => s.type === SocialProfileType.FARCASTER))
        .filter(Boolean) as SocialProfile[]) || [];

    return currentUserFarcasterFollowings
      .filter(profile => profileHolders.some(holder => holder.id === profile.id))
      .map(profile => profile);
  }, [currentUser?.socialProfiles, profile.holders, profile.user]);

  const farcasterProfile = allSocials.find(socialProfile => socialProfile.type === SocialProfileType.FARCASTER);

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
              {(profile.hasKeys || !profile.hasLaunchedKeys || !profile.isGated) && !profile.isOwnProfile && (
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() =>
                    router.push({
                      pathname: "/question",
                      searchParams: { ask: true, wallet: profile.user?.wallet.toLowerCase() }
                    })
                  }
                >
                  Ask
                </Button>
              )}
              {profile.hasKeys && (
                <Button
                  variant="outlined"
                  color="danger"
                  onClick={() => router.replace({ searchParams: { tradeModal: "sell" } })}
                  disabled={(supply || 0) <= BigInt(1)}
                >
                  Sell
                </Button>
              )}
              {isAuthenticatedAndActive && profile.user && profile.hasLaunchedKeys && (
                <Button disabled={true} onClick={() => router.replace({ searchParams: { tradeModal: "buy" } })}>
                  Buy
                </Button>
              )}

              {isAuthenticatedAndActive && profile.user && profile.isOwnProfile && !profile.hasLaunchedKeys && (
                <Button disabled={true} onClick={() => router.replace({ searchParams: { tradeModal: "buy" } })}>
                  Create keys
                </Button>
              )}
              {!profile.user && farcasterProfile && (
                <Link
                  href={`https://warpcast.com/~/compose?${encodeQueryData({
                    text: NEW_BUILDERFI_INVITE_CAST.replace("{username}", farcasterProfile.profileName)
                  })}`}
                  target="_blank"
                >
                  <Button>invite</Button>
                </Link>
              )}
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
              {profile.user?.socialProfiles?.find(socialProfile => socialProfile.type === SocialProfileType.FARCASTER)
                ?.followerCount && (
                <Flex flexDirection={"row"} alignItems={"center"}>
                  <Typography level="body-sm">
                    <strong>
                      {nFormatter(
                        profile.user?.socialProfiles?.find(
                          socialProfile => socialProfile.type === SocialProfileType.FARCASTER
                        )?.followerCount
                      )}
                    </strong>{" "}
                    followers on Farcaster
                  </Typography>
                </Flex>
              )}
            </Flex>
          )}

          {followingAndHoldersIntersection?.length > 0 && !isCurrentUserProfilePage && (
            <Flex x gap1 alignItems={"center"}>
              <Avatar size="sm" src={followingAndHoldersIntersection[0].profileImage!} />
              <Typography level="body-sm">
                {followingAndHoldersIntersection.length === 1 ? (
                  <div>
                    <Typography fontWeight={600}>{followingAndHoldersIntersection[0].profileName}</Typography> also owns
                    keys
                  </div>
                ) : (
                  <div>
                    <Typography fontWeight={600}>{followingAndHoldersIntersection[0].profileName}</Typography> and{" "}
                    {followingAndHoldersIntersection.length - 1} others that you know also own keys
                  </div>
                )}
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
