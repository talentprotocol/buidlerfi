import { getAirstackSocialData } from "@/lib/api/backend/airstack/social-profile";
import prisma from "@/lib/prisma";
import { formatError } from "@/lib/utils";
import { SocialProfileType } from "@prisma/client";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const GET = async () => {
  try {
    //Find all users who have a farcaster account
    const profileData = await prisma.socialProfile.findMany({
      where: {
        type: SocialProfileType.FARCASTER
      },
      include: {
        user: { select: { id: true, socialWallet: true } }
      }
    });

    //socialProfileId to followers count
    const followersCount = new Map<number, number>();

    for (const profile of profileData) {
      if (!profile.user.socialWallet) continue;
      const airstackData = await getAirstackSocialData(profile.user.socialWallet);
      const farcasterSocial = airstackData.socials?.find(s => s.dappName === "farcaster");
      if (!farcasterSocial) continue;
      //only update if the followers count has changed
      if (profile.followerCount !== farcasterSocial.followerCount)
        followersCount.set(profile.id, farcasterSocial.followerCount);

      //wait 500 ms to prevent rate limit from airstack
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await prisma.$transaction(async tx => {
      for (const [profileId, followers] of followersCount) {
        await tx.socialProfile.update({
          where: {
            id: profileId
          },
          data: {
            followerCount: followers
          }
        });
      }
    });

    return NextResponse.json({ data: "ok" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: formatError(err) }, { status: 500 });
  }
};
