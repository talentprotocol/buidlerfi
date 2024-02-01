import prisma from "@/lib/prisma";

export const getTopics = async (privyUserId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId
    }
  });

  const topics = await prisma.topic.findMany({
    include: {
      topicOwners: {
        where: {
          holderId: user.id
        }
      }
    }
  });

  const res = topics.map(({ id, name, createdAt, topicOwners }) => ({
    id,
    name,
    createdAt,
    purchased: topicOwners.length > 0
  }));

  return { data: res };
};
