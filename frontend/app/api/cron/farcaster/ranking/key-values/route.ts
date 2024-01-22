import { publishTopFarcasterKeyValueCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";
import { formatUnits } from "viem";

export const revalidate = 0;
export const GET = async () => {
  try {
    // Fetch trades, ordered by timestamp (or another field indicating recency)
    const trades = await prisma.keyRelationship.groupBy({
      by: "ownerId",
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: "desc"
        }
      },
      where: {
        owner: {
          isActive: true,
          isAdmin: false,
          socialProfiles: {
            some: {
              type: "FARCASTER"
            }
          }
        }
      },
      take: 10
    });

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: trades.map(trade => trade.ownerId)
        }
      },
      include: {
        socialProfiles: true
      }
    });

    // Extracting owners and values
    const data = users.map(user => ({
      username: user.socialProfiles.find(p => p.type === SocialProfileType.FARCASTER)?.profileName,
      price: formatUnits(trade.amount, 18)
    }));

    // publish cast on Farcaster
    await publishTopFarcasterKeyValueCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster users by key value" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
