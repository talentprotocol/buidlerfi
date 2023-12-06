import { getCastUrl, publishNewUserKeysCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";

export async function POST(req: Request) {
  if (process.env.ENABLE_FARCASTER === "true") {
    const user = await prisma.user.findUnique({
      where: { privyUserId: req.headers.get("privyUserId")! },
      include: { socialProfiles: true }
    });
    const userFarcaster = user?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    if (!userFarcaster) {
      return Response.json({ error: ERRORS.USER_NOT_ON_FARCASTER }, { status: 400 });
    }
    const castHash = await publishNewUserKeysCast(
      userFarcaster.profileName,
      `https://app.builder.fi/profile/${user?.wallet}`
    );
    return Response.json({ castUrl: getCastUrl(castHash) });
  }
  return Response.json({ success: true });
}
