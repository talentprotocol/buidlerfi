import { publishNewUserKeysCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { userId: number } }) {
  if (process.env.NODE_ENV !== "production") {
    const userFarcaster = await prisma.socialProfile.findUniqueOrThrow({
      where: {
        userId_type: {
          userId: params.userId,
          type: SocialProfileType.FARCASTER
        }
      }
    });
    if (!userFarcaster) {
      return Response.json({ error: ERRORS.USER_NOT_ON_FARCASTER }, { status: 400 });
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: params.userId } });
    await publishNewUserKeysCast(userFarcaster.profileName, `https://app.builder.fi/profile/${user.wallet}`);
  }
  return Response.json({ success: true });
}
