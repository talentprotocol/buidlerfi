"use server";

import prisma from "@/lib/prisma";

export const getKeyRelationships = async (address: string, side: "owner" | "holder") => {
  const relationships = await prisma.keyRelationship.findMany({
    where:
      side === "owner"
        ? {
            owner: {
              wallet: address.toLowerCase()
            },
            amount: {
              gt: 0
            }
          }
        : {
            holder: {
              wallet: address.toLowerCase()
            },
            amount: {
              gt: 0
            }
          },
    include: { holder: true, owner: true },
    orderBy: {
      amount: "desc"
    }
  });

  return { data: relationships };
};

//Can pass either userId, privyUserId or wallet for user
export const ownsKey = async (
  ownerUser: { userId?: number; privyUserId?: string; wallet?: string },
  holderUser: { userId?: number; privyUserId?: string; wallet?: string }
) => {
  if (
    (!holderUser.privyUserId && !holderUser.userId && !holderUser.wallet) ||
    (!ownerUser.privyUserId && !ownerUser.userId && !ownerUser.wallet)
  )
    return false;

  const key = await prisma.keyRelationship.findFirst({
    where: {
      owner: {
        id: ownerUser.userId,
        privyUserId: ownerUser.privyUserId,
        wallet: ownerUser.wallet?.toLowerCase()
      },
      holder: {
        id: holderUser.userId,
        privyUserId: holderUser.privyUserId,
        wallet: holderUser.wallet?.toLowerCase()
      },
      amount: {
        gt: 0
      }
    }
  });

  return !!key;
};
