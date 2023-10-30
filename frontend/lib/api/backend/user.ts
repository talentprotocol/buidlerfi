import prisma from "@/lib/prisma";
import { GetTalentResponse } from "@/models/talentProtocol.model";
import { SocialProfileType, User } from "@prisma/client";
import axios from "axios";
import { getEnsProfile } from "../common/ens";
import { getAirstackSocialData } from "./airstack";

export const updateUserSocialProfiles = async (user: User) => {
  const ensProfile = await getEnsProfile(user.wallet as `0x${string}`);
  const talentProtocolProfile = await axios
    .get<GetTalentResponse>(`${process.env.TALENT_PROTOCOL_API_BASE_URL}/talents/${user.wallet}`)
    .then(res => res.data)
    .catch(() => undefined);
  const airstackData = await getAirstackSocialData(user.wallet);
  const lensProfile = airstackData.socials?.find(social => social.dappName === "lens");
  const farcasterProfile = airstackData.socials?.find(social => social.dappName === "farcaster");

  if (ensProfile.name) {
    await prisma.socialProfile.create({
      data: {
        profileName: ensProfile.name,
        profileImage: ensProfile.avatar,
        type: SocialProfileType.ENS,
        userId: user.id
      }
    });
  }

  if (talentProtocolProfile) {
    await prisma.socialProfile.create({
      data: {
        profileName: talentProtocolProfile.talent.name,
        profileImage: talentProtocolProfile.talent.profile_picture_url,
        type: SocialProfileType.TALENT_PROTOCOL,
        userId: user.id
      }
    });
  }

  if (lensProfile) {
    await prisma.socialProfile.create({
      data: {
        profileName: lensProfile.profileName,
        profileImage: lensProfile.profileImage,
        type: SocialProfileType.LENS,
        userId: user.id
      }
    });
  }

  if (farcasterProfile) {
    await prisma.socialProfile.create({
      data: {
        profileName: farcasterProfile.profileName,
        profileImage: farcasterProfile.profileImage,
        type: SocialProfileType.FARCASTER,
        userId: user.id
      }
    });
  }

  const defaultAvatar =
    farcasterProfile?.profileImage ||
    lensProfile?.profileImage ||
    ensProfile.avatar ||
    talentProtocolProfile?.talent.profile_picture_url;
  const defaultName =
    talentProtocolProfile?.talent.name || farcasterProfile?.profileName || lensProfile?.profileName || ensProfile.name;

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      avatarUrl: defaultAvatar,
      displayName: defaultName
    },
    include: {
      socialProfiles: true
    }
  });
};
