import { publishTopFarcasterKeyValueCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { KeyPricing, SocialProfileType } from "@prisma/client";
import { formatUnits } from "viem";

export const revalidate = 0;
export const GET = async () => {
  console.log("Running cron job: Top 10 Farcaster users by key value");
  try {
    console.log("Fetching key prices");
    const keyPrices = await prisma.keyPricing.findMany();
    const keyPricesObj = keyPrices.reduce(
      (acc: Record<number, { buyPrice: bigint; sellPrice: bigint }>, keyPrice: KeyPricing) => {
        acc[keyPrice.shares] = {
          buyPrice: keyPrice.buyPrice,
          sellPrice: keyPrice.sellPrice
        };
        return acc;
      },
      {}
    );

    console.log("Fetching top 10 Farcaster users by amount of keys");
    const keyRelationships = (
      await prisma.keyRelationship.groupBy({
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
      })
    ).map(keyRelationship => ({
      ownerId: keyRelationship.ownerId,
      amount: Number(keyRelationship._sum.amount)
    }));

    console.log("Fetching users");
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: keyRelationships.map(trade => trade.ownerId)
        }
      },
      include: {
        socialProfiles: true
      }
    });

    // Extracting owners and values
    const data = users.map(user => ({
      username: user.socialProfiles.find(p => p.type === SocialProfileType.FARCASTER)!.profileName,
      price: formatUnits(keyPricesObj[keyRelationships.find(t => t.ownerId === user.id)!.amount].buyPrice, 18)
    }));

    console.log("Publishing cast");
    // publish cast on Farcaster
    await publishTopFarcasterKeyValueCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster users by key value" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
