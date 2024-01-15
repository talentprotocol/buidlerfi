import {
  getFarcasterProfileName,
  publishBuyTradeUserKeysCast,
  publishNewUserKeysCast,
  publishSellTradeUserKeysCast
} from "@/lib/api/backend/farcaster";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";

export async function publishNewUserCast(privyUserId: string) {
  if (process.env.ENABLE_FARCASTER === "true") {
    const user = await prisma.user.findUnique({ where: { privyUserId }, include: { socialProfiles: true } });
    const userFarcaster = user?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    if (!userFarcaster) {
      return { data: { hash: "" } };
    }
    const castHash = await publishNewUserKeysCast(
      `@${userFarcaster.profileName}`,
      `https://app.builder.fi/profile/${user?.wallet}`
    );
    return { data: { hash: castHash } };
  }
  return { data: { hash: "" } };
}

export async function publishNewTradeKeysCast(ownerPrivyUserId: string, holderPrivyUserId2: string, isBuy: boolean, price: string) {
  if (process.env.ENABLE_FARCASTER === "true") {
    // Check for owner
    const owner = await prisma.user.findUnique({
      where: { privyUserId: ownerPrivyUserId },
      include: { socialProfiles: true }
    });
    const ownerFarcaster = owner?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    // Check for holder
    const holder = await prisma.user.findUnique({
      where: { privyUserId: holderPrivyUserId2 },
      include: { socialProfiles: true }
    });
    const holderFarcaster = holder?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);

    // Check if at least one of them has a Farcaster profile
    if (!ownerFarcaster && !holderFarcaster) {
      return { data: { hash: "" } };
    }

    // Check if is a buy or sell cast
    if (isBuy) {
      const castHash = await publishBuyTradeUserKeysCast(
        getFarcasterProfileName(holder!, holderFarcaster),
        getFarcasterProfileName(owner!, ownerFarcaster),
        `${price}`,
        `https://app.builder.fi/profile/${holder?.wallet}`
      );
      return { data: { hash: castHash } };
    } else {
      const castHash = await publishSellTradeUserKeysCast(
        getFarcasterProfileName(holder!, holderFarcaster),
        getFarcasterProfileName(owner!, ownerFarcaster),
        `${price}`,
        `https://app.builder.fi/profile/${holder?.wallet}`
      );
      return { data: { hash: castHash } };
    }
  }
  return { data: { hash: "" } };
}
