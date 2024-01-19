import { publishTopFarcasterKeyValueCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { formatUnits } from "viem";

export const GET = async () => {
  try {
    // Fetch trades, ordered by timestamp (or another field indicating recency)
    const trades = (await prisma.$queryRaw`
      SELECT "Trade".*, "User".*, "SocialProfile".*
      FROM (
        SELECT "ownerAddress", MAX("amount") as "maxAmount", MAX("timestamp") as "maxTimestamp"
        FROM "Trade"
        GROUP BY "ownerAddress"
      ) as "MaxTrade"
      INNER JOIN "Trade" ON "Trade"."ownerAddress" = "MaxTrade"."ownerAddress" AND "Trade"."amount" = "MaxTrade"."maxAmount" AND "Trade"."timestamp" = "MaxTrade"."maxTimestamp"
      INNER JOIN "User" ON "User"."wallet" = "Trade"."ownerAddress"
      INNER JOIN "SocialProfile" ON "SocialProfile"."userId" = "User"."id" AND "SocialProfile"."type" = 'FARCASTER'
      ORDER BY "Trade"."amount" DESC, "Trade"."timestamp" DESC;
    `) as { profileName: string; amount: bigint }[];

    // Extracting owners and values
    const data = trades.map(trade => ({
      username: trade.profileName,
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
