"use server";
import prisma from "@/lib/prisma";

//We don't need to wrap this in a serverActionWrapper because it doesn't require authentication
export const getTags = async () => {
  return { data: await prisma.tag.findMany({ orderBy: { name: "asc" } }) };
};
