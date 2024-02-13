import { getAirstackSocialData } from "@/lib/api/backend/airstack/social-profile";
import { getEnsProfile } from "@/lib/api/common/ens";
import prisma from "@/lib/prisma";
import privyClient from "@/lib/privyClient";
import { ipfsToURL } from "@/lib/utils";
import { GetTalentResponse } from "@/models/talentProtocol.model";
import { SocialProfileType } from "@prisma/client";
import axios from "axios";

interface airstackSocial {
  dappName: string;
  profileName: string;
  profileImage: string;
  profileBio: string;
  followerCount: number;
  followingCount: number;
}

export const updateUserSocialProfiles = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) return;

  const wallet = user?.socialWallet as `0x${string}` | undefined;

  let ensProfile: { name?: string | null; avatar?: string } = {};
  let talentProtocolProfile: GetTalentResponse | undefined;
  let lensProfile: airstackSocial | undefined;
  let farcasterProfile: airstackSocial | undefined;
  if (wallet) {
    try {
      ensProfile = await getEnsProfile(wallet);
      if (ensProfile.name) {
        await prisma.socialProfile.upsert({
          where: {
            userId_type: {
              userId: userId,
              type: SocialProfileType.ENS
            }
          },
          update: {
            profileName: ensProfile.name,
            profileImage: ensProfile.avatar
          },
          create: {
            profileName: ensProfile.name,
            profileImage: ensProfile.avatar,
            type: SocialProfileType.ENS,
            userId: userId
          }
        });
      }
    } catch (err) {
      console.error("Error while updating ENS profile: ", err);
    }
  }

  if (wallet) {
    try {
      talentProtocolProfile = await axios
        .get<GetTalentResponse>(`${process.env.TALENT_PROTOCOL_API_BASE_URL}/talents/${wallet}`)
        .then(res => res.data)
        .catch(() => undefined);
      if (talentProtocolProfile) {
        try {
          const imageUrl = new URL(talentProtocolProfile.talent.profile_picture_url);
          talentProtocolProfile.talent.profile_picture_url = imageUrl.origin + imageUrl.pathname;
        } catch {
          // ignore, leave empty
        }

        await prisma.socialProfile.upsert({
          where: {
            userId_type: {
              userId: userId,
              type: SocialProfileType.TALENT_PROTOCOL
            }
          },
          update: {
            profileName: talentProtocolProfile.talent.username,
            profileImage: talentProtocolProfile.talent.profile_picture_url
          },
          create: {
            profileName: talentProtocolProfile.talent.username,
            profileImage: talentProtocolProfile.talent.profile_picture_url,
            type: SocialProfileType.TALENT_PROTOCOL,
            userId: userId
          }
        });
      }
    } catch (err) {
      console.error("Error while updating Talent Protocol profile: ", err);
    }
  }

  try {
    const airstackData = wallet ? await getAirstackSocialData(wallet) : { socials: [] };
    lensProfile = airstackData?.socials?.find(social => social.dappName === "lens");
    if (lensProfile?.profileName) {
      lensProfile.profileName = lensProfile?.profileName.replace("lens/@", "");
    }
    if (lensProfile?.profileImage) {
      lensProfile.profileImage = ipfsToURL(lensProfile.profileImage);
    }

    farcasterProfile = airstackData?.socials?.find(social => social.dappName === "farcaster");

    //Check if farcaster account is linked to privy and try to fetch info from there
    if (!farcasterProfile) {
      const privyFarcasterProfile = user.privyUserId
        ? (await privyClient.getUser(user.privyUserId)).farcaster
        : undefined;
      if (privyFarcasterProfile) {
        const profile = await getAirstackSocialData(privyFarcasterProfile.ownerAddress.toLowerCase());
        farcasterProfile = profile?.socials?.find(social => social.dappName === "farcaster");
      }
    }

    if (farcasterProfile?.profileImage) {
      farcasterProfile.profileImage = ipfsToURL(farcasterProfile.profileImage);
    }

    if (lensProfile) {
      await prisma.socialProfile.upsert({
        where: {
          userId_type: {
            userId: userId,
            type: SocialProfileType.LENS
          }
        },
        update: {
          profileName: lensProfile.profileName,
          profileImage: lensProfile.profileImage,
          bio: lensProfile.profileBio,
          followerCount: lensProfile.followerCount,
          followingCount: lensProfile.followingCount
        },
        create: {
          profileName: lensProfile.profileName,
          profileImage: lensProfile.profileImage,
          type: SocialProfileType.LENS,
          userId: userId,
          bio: lensProfile.profileBio,
          followerCount: lensProfile.followerCount,
          followingCount: lensProfile.followingCount
        }
      });
    }

    if (farcasterProfile) {
      await prisma.socialProfile.upsert({
        where: {
          userId_type: {
            userId: userId,
            type: SocialProfileType.FARCASTER
          }
        },
        update: {
          profileName: farcasterProfile.profileName,
          profileImage: farcasterProfile.profileImage,
          bio: farcasterProfile.profileBio,
          followerCount: farcasterProfile.followerCount,
          followingCount: farcasterProfile.followingCount
        },
        create: {
          profileName: farcasterProfile.profileName,
          profileImage: farcasterProfile.profileImage,
          bio: farcasterProfile.profileBio,
          followerCount: farcasterProfile.followerCount,
          followingCount: farcasterProfile.followingCount,
          type: SocialProfileType.FARCASTER,
          userId: userId
        }
      });
    }
  } catch (err) {
    console.error("Error while updating Airstack profile: ", err);
  }

  const defaultAvatar =
    talentProtocolProfile?.talent.profile_picture_url ||
    farcasterProfile?.profileImage ||
    lensProfile?.profileImage ||
    ensProfile.avatar;
  const defaultName =
    talentProtocolProfile?.talent.name || farcasterProfile?.profileName || lensProfile?.profileName || ensProfile.name;
  return await prisma.user.update({
    where: { id: userId },
    data: {
      //avatarUrl and displayname is always fetched from other sources. So we can override
      avatarUrl: (defaultAvatar ?? user.avatarUrl) || undefined,
      displayName: (defaultName ?? user.displayName) || undefined,
      //Bio is either user-defined, or fetched. So we don't override it
      bio: user.bio || farcasterProfile?.profileBio || lensProfile?.profileBio || ""
    },
    include: {
      socialProfiles: true
    }
  });
};
