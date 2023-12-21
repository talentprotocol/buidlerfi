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
