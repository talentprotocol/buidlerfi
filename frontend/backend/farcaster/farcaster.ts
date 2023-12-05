import { publishNewUserKeysCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";

export async function publishNewUserCast(privyUserId: string) {
  if (process.env.NODE_ENV !== "production" || true) {
    const user = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });
    const userFarcaster = await prisma.socialProfile.findUniqueOrThrow({
      where: {
        userId_type: {
          userId: user.id,
          type: SocialProfileType.FARCASTER
        }
      }
    });
    if (!userFarcaster) {
      return { error: ERRORS.USER_NOT_ON_FARCASTER };
    }
    const castHash = await publishNewUserKeysCast(
      userFarcaster.profileName,
      `https://app.builder.fi/profile/${user.wallet}`
    );
    return { data: { hash: castHash } };
  }
  return { data: { hash: "" } };
}
