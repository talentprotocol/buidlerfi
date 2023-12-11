import { publishNewUserKeysCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";

export async function publishNewUserCast(privyUserId: string) {
  if (process.env.ENABLE_FARCASTER === "true") {
    const user = await prisma.user.findUnique({ where: { privyUserId }, include: { socialProfiles: true } });
    const userFarcaster = user?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    if (!userFarcaster) {
      return { error: ERRORS.USER_NOT_ON_FARCASTER };
    }
    const castHash = await publishNewUserKeysCast(
      `@${userFarcaster.profileName}`,
      `https://app.builder.fi/profile/${user?.wallet}`
    );
    return { data: { hash: castHash } };
  }
  return { data: { hash: "" } };
}
