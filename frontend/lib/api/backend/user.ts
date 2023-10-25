import prisma from "@/lib/prisma";
import { GetTalentResponse } from "@/models/talentProtocol.model";
import { SocialProfileType, User } from "@prisma/client";
import axios from "axios";
import { getEnsProfile } from "../common/ens";
import { getAirstackSocialData } from "./airstack";

export const updateUserSocialProfiles = async (user: User) => {
  const ensProfile = await getEnsProfile(user.wallet as `0x${string}`);
  console.log("ensProfile", ensProfile);
  const talentProtocolProfile = await axios
    .get<GetTalentResponse>(`${process.env.TALENT_PROTOCOL_API_BASE_URL}/talents/${user.wallet}`)
    .then(res => res.data);
  console.log("talentProtocolProfile", talentProtocolProfile);
  const airstackData = await getAirstackSocialData(user.wallet);
  console.log("airstackData", airstackData);
  const lensProfile = airstackData.socials?.find(social => social.dappName === "lens");
  const farcasterProfile = airstackData.socials?.find(social => social.dappName === "farcaster");

  return await prisma.$transaction(async tx => {
    if (ensProfile.name) {
      tx.socialProfile.create({
        data: {
          profileName: ensProfile.name,
          profileImage: ensProfile.avatar,
          type: SocialProfileType.ENS,
          userId: user.id
        }
      });
    }

    if (talentProtocolProfile) {
      tx.socialProfile.create({
        data: {
          profileName: talentProtocolProfile.talent.name,
          profileImage: talentProtocolProfile.talent.profile_picture_url,
          type: SocialProfileType.TALENT_PROTOCOL,
          userId: user.id
        }
      });
    }

    if (lensProfile) {
      tx.socialProfile.create({
        data: {
          profileName: lensProfile.profileName,
          profileImage: lensProfile.profileImage,
          type: SocialProfileType.LENS,
          userId: user.id
        }
      });
    }

    if (farcasterProfile) {
      tx.socialProfile.create({
        data: {
          profileName: farcasterProfile.profileName,
          profileImage: farcasterProfile.profileImage,
          type: SocialProfileType.FARCASTER,
          userId: user.id
        }
      });
    }

    if (!user.avatarUrl || !user.displayName) {
      const defaultAvatar =
        talentProtocolProfile?.talent.profile_picture_url ||
        farcasterProfile?.profileImage ||
        lensProfile?.profileImage ||
        ensProfile.avatar;
      const defaultName =
        talentProtocolProfile?.talent.name ||
        farcasterProfile?.profileName ||
        lensProfile?.profileName ||
        ensProfile.name;

      return await tx.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: defaultAvatar,
          displayName: defaultName
        }
      });
    }
  });
};
