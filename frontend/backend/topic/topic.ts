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

  return { data: res.sort((a, b) => a.name.localeCompare(b.name)) };
};

export const getTopic = async (privyUserId: string, topicId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId
    }
  });

  const topic = await prisma.topic.findUniqueOrThrow({
    where: {
      id: parseInt(topicId)
    },
    include: {
      topicOwners: {
        where: {
          holderId: user.id
        }
      },
      questions: {
        where: {
          topicId: parseInt(topicId)
        },
        include: {
          comments: true,
          replier: true,
          questioner: true,
          topic: {
            select: { name: true }
          }
        }
      }
    }
  });

  const hasKey = topic.topicOwners.length > 0;

  return {
    id: topic.id,
    name: topic.name,
    createdAt: topic.createdAt,
    hasKey,
    questions: topic.questions.map(question => ({
      ...question,
      comments: question.comments.map(comment => ({
        ...comment,
        content: hasKey || !comment.gated ? comment.content : ""
      }))
    }))
  };
};
