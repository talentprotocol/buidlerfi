"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type GetKeyRelationshipArgs = Omit<Prisma.KeyRelationshipFindManyArgs, "include" | "take" | "skip">;

export const getKeyRelationships = async (args: GetKeyRelationshipArgs) => {
  const relationships = await prisma.keyRelationship.findMany({
    where: {
      ...args.where
    },
    include: { holder: true, owner: true },
    orderBy: args.orderBy
  });

  return { data: relationships };
};
