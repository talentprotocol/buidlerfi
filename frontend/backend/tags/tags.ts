"use server";
import prisma from "@/lib/prisma";

export const getTags = async () => {
  return { data: await prisma.tag.findMany({ orderBy: { name: "asc" } }) };
};
