import { getAirstackFarcasterFollowings } from "@/lib/api/backend/airstack/farcaster-followings";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";

export const syncFarcasterFollowings = async (userId: number) => {
  const farcasterSocialProfile = await prisma.socialProfile.findFirst({
    where: {
      type: SocialProfileType.FARCASTER,
      userId
    }
  });
  if (!farcasterSocialProfile) {
    return;
  }
  const followingProfileNames = await getAirstackFarcasterFollowings(farcasterSocialProfile.profileName);
  const followingSocialProfiles = await prisma.socialProfile.findMany({
    where: {
      profileName: {
        in: followingProfileNames
      }
    }
  });
  const followingUserIds = followingSocialProfiles.map(socialProfile => socialProfile.id);
  await prisma.$transaction(async tx => {
    // first clean the old recommended users
    await tx.socialProfileFollowing.deleteMany({
      where: { profileId: farcasterSocialProfile.id }
    });

    // then create them again to update the list
    await tx.socialProfileFollowing.createMany({
      data: followingUserIds.map(profileId => ({
        profileId: farcasterSocialProfile.id,
        followingId: profileId
      }))
    });
  });
};
