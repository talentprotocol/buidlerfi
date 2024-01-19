import { publishTopFarcasterKeyValueCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";
import { formatUnits } from "viem";

export const GET = async () => {
  try {
    // Fetch trades, ordered by timestamp (or another field indicating recency)
    const trades = await prisma.trade.findMany({
      orderBy: {
        amount: "desc",
        timestamp: "desc"
      },
      include: {
        owner: {
          include: {
            socialProfiles: {
              where: {
                type: SocialProfileType.FARCASTER
              }
            }
          }
        }
      },
      where: {
        owner: {
          socialProfiles: {
            some: {
              type: "FARCASTER"
            }
          }
        }
      }
    });

    // Extracting owners and values
    const data = trades.map(trade => ({
      username: trade.owner.socialProfiles.find(p => p.type === SocialProfileType.FARCASTER)!.profileName,
      price: formatUnits(trade.amount, 18)
    }));

    // publish cast on Farcaster
    const cast = await publishTopFarcasterKeyValueCast(data);
    console.log(cast);
    return Response.json({ message: "Done: Top 10 Farcaster users by key value" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
