import { prisma } from "@/lib/prisma";

export const getAllQuest = async () => {
  const res = await prisma.quest.findMany({
    where: {
      isActive: true
    }
  });
  return { data: res };
};

export const getUserQuest = async (privyUserId: string) => {
  const res = await prisma.userQuest.findMany({
    where: {
      user: {
        privyUserId
      }
    }
  });
  return { data: res };
};
