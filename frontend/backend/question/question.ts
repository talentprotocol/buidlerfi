"use server";

import { getFarcasterProfileName, publishNewQuestionCast } from "@/lib/api/backend/farcaster";
import { MIN_QUESTION_LENGTH, PAGINATION_LIMIT, WEEK_IN_MILLISECONDS } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { exclude } from "@/lib/exclude";
import prisma from "@/lib/prisma";
import { NotificationType, Prisma, ReactionType, SocialProfileType } from "@prisma/client";
import { getKeyRelationships, ownsKey } from "../keyRelationship/keyRelationship";
import { sendNotification } from "../notification/notification";

export const createQuestion = async (privyUserId: string, questionContent: string, replierId: number) => {
  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  const questioner = await prisma.user.findUniqueOrThrow({
    where: { privyUserId },
    include: { socialProfiles: true, keysOwned: true }
  });
  const replier = await prisma.user.findUniqueOrThrow({
    where: { id: replierId },
    include: { socialProfiles: true, keysOfSelf: true }
  });

  if (replier.keysOfSelf.length > 0) {
    const key = questioner.keysOwned.find(key => key.ownerId === replierId);
    if (!key || key.amount === BigInt(0)) {
      return { error: ERRORS.MUST_HOLD_KEY };
    }
  }

  const question = await prisma.$transaction(async tx => {
    const question = await tx.question.create({
      data: { questionerId: questioner.id, replierId: replier.id, questionContent: questionContent }
    });
    await sendNotification(replier.id, "ASKED_QUESTION", questioner.id, question.id, tx);

    return question;
  });
  // if in production, push the question to farcaster
  console.log("Farcaster enabled -> ", process.env.ENABLE_FARCASTER);
  if (process.env.ENABLE_FARCASTER === "true") {
    const questionerFarcaster = questioner.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    const replierFarcaster = replier.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);

    console.log("FOUND questioner -> ", !!questionerFarcaster);
    console.log("FOUND replier -> ", !!replierFarcaster);

    if (questionerFarcaster || replierFarcaster) {
      const replierName = getFarcasterProfileName(replier, replierFarcaster);
      const questionerName = getFarcasterProfileName(questioner, questionerFarcaster);
      // if one of the two has farcaster, publish the cast
      console.log("CASTING NEW QUESTION");
      await publishNewQuestionCast(
        questionerName,
        replierName,
        `https://app.builder.fi/profile/${replier.wallet}?question=${question.id}`
      );
    }
  }
  return { data: question };
};

export const createOpenQuestion = async (privyUserId: string, questionContent: string, tag?: string) => {
  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  if (tag) {
    await prisma.tag.findUniqueOrThrow({ where: { name: tag } });
  }

  const questioner = await prisma.user.findUniqueOrThrow({
    where: { privyUserId },
    include: { socialProfiles: true }
  });
  const res = await prisma.$transaction(async tx => {
    const question = await tx.question.create({
      data: {
        questionerId: questioner.id,
        replierId: null,
        questionContent: questionContent,
        tags: tag
          ? {
              connect: {
                name: tag
              }
            }
          : undefined
      }
    });
    if (tag) {
      const usersWithTag = await tx.user.findMany({ where: { tags: { some: { name: tag } } } });
      for (const user of usersWithTag) {
        await sendNotification(user.id, NotificationType.NEW_OPEN_QUESTION, questioner.id, question.id, tx);
      }
    }

    return question;
  });

  return { data: res };
};

type getHotQuestionResponse = Prisma.QuestionGetPayload<{
  select: {
    id: true;
    questionContent: true;
    repliedOn: true;
    createdAt: true;
    questioner: {
      select: {
        displayName: true;
        avatarUrl: true;
        id: true;
        wallet: true;
      };
    };
    replier: {
      select: {
        displayName: true;
        avatarUrl: true;
        id: true;
        wallet: true;
      };
    };
    tags: { select: { name: true } };
  };
}>;

export async function getHotQuestions(offset: number, filters: { questionerId?: number; replierId?: number } = {}) {
  const rawResult: any[] = await prisma.$queryRaw`
    SELECT
      q.id,
      q."questionContent",
      q."repliedOn",
      q."createdAt",
      "questioner".id AS "questionerId",
      "questioner"."displayName" AS "questionerDisplayName",
      "questioner"."avatarUrl" AS "questionerAvatarUrl",
      "questioner"."wallet" AS "questionerWallet",
      replier.id AS "replierId",
      replier."displayName" AS "replierDisplayName",
      replier."avatarUrl" AS "replierAvatarUrl",
      replier."wallet" AS "replierWallet",
      COALESCE(SUM(CASE WHEN r."reactionType" = 'UPVOTE' THEN 1 ELSE 0 END), 0) 
      - COALESCE(SUM(CASE WHEN r."reactionType" = 'DOWNVOTE' THEN 1 ELSE 0 END), 0) 
      AS net_upvotes,
      STRING_AGG(t.name, ', ') AS tags
    FROM
      "Question" AS q
  	LEFT JOIN
      "User" AS "replier" ON q."replierId" = replier.id
    LEFT JOIN
      "User" AS "questioner" ON q."questionerId" = questioner.id
    LEFT JOIN
      "Reaction" AS r ON q.id = r."questionId"
    LEFT JOIN
    "_QuestionToTag" AS qt ON q.id = qt."A"
    LEFT JOIN
      "Tag" AS t ON qt."B" = t.id
    WHERE
        (${filters.questionerId || 0} != 0 AND q."questionerId" = ${filters.questionerId})
      OR
        (${filters.replierId || 0} != 0 AND q."replierId" = ${filters.replierId})
      OR
        (${filters.questionerId || 0} = 0 AND ${filters.replierId || 0} = 0)
    GROUP BY
		q.id,
		"questioner".id,
		"questioner"."displayName",
		"questioner"."avatarUrl",
		replier.id,
		replier."displayName",
		replier."avatarUrl"
    ORDER BY
        net_upvotes DESC
    LIMIT ${PAGINATION_LIMIT}
    OFFSET ${offset}
`;

  const transformedResults = rawResult.map(row => {
    const question: getHotQuestionResponse = {
      id: row.id,
      questionContent: row.questionContent,
      repliedOn: row.repliedOn,
      createdAt: row.createdAt,
      questioner: {
        id: row.questionerId,
        displayName: row.questionerDisplayName,
        avatarUrl: row.questionerAvatarUrl,
        wallet: row.questionerWallet
      },
      replier: {
        id: row.replierId,
        displayName: row.replierDisplayName,
        avatarUrl: row.replierAvatarUrl,
        wallet: row.questionerWallet
      },
      tags: row.tags?.split(",").map((tag: string) => ({ name: tag })) || []
    };
    return question;
  });

  return { data: transformedResults };
}

export async function getKeysQuestions(privyUserId: string, offset: number) {
  const currentUser = await prisma.user.findFirstOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });
  const keys = await getKeyRelationships(currentUser.wallet, "holder");
  const res = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      replier: {
        id: { in: keys.data?.map(holding => holding.owner.id) }
      }
    },
    include: {
      questioner: true,
      replier: true,
      tags: true
    },
    take: PAGINATION_LIMIT,
    skip: offset
  });

  return { data: res };
}

export async function getReactions(questionId: number, type: "like" | "upvote") {
  const reactions = await prisma.reaction.findMany({
    where: {
      questionId: type === "upvote" ? questionId : undefined,
      replyId: type === "like" ? questionId : undefined
    }
  });

  return { data: reactions };
}

export type getQuestionsArgs = Omit<Prisma.QuestionFindManyArgs, "include" | "take" | "skip">;

export async function getQuestions(args: getQuestionsArgs, offset: number) {
  const questions = await prisma.question.findMany({
    where: {
      ...args.where
    },
    include: {
      questioner: true,
      replier: true,
      tags: true
    },
    take: PAGINATION_LIMIT,
    orderBy: args.orderBy,
    skip: offset
  });

  return { data: exclude(questions, ["reply"]) };
}

//We allow privyUserId to be undefiend for public endpoint
export const getQuestion = async (questionId: number, privyUserId?: string, includeSocialProfiles: boolean = false) => {
  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    },
    include: {
      reactions: true,
      _count: {
        select: {
          comments: true
        }
      },
      questioner: {
        ...(includeSocialProfiles && {
          include: {
            socialProfiles: true
          }
        })
      },
      replier: {
        ...(includeSocialProfiles && {
          include: {
            socialProfiles: true
          }
        })
      },
      replyReactions: true
    }
  });

  //We need to check privyUserId explicitely also because if it's undefined, it's going to return the system user
  if (!privyUserId) return { data: exclude(question, ["reply"]) };

  const hasKey = !question.replierId || (await ownsKey({ userId: question.replierId }, { privyUserId }));
  const hasLaunchedKey =
    question.replierId && (await ownsKey({ userId: question.replierId }, { userId: question.replierId }));
  if (hasKey || !hasLaunchedKey) return { data: question };
  else return { data: exclude(question, ["reply"]) };
};

export async function getMostUpvotedQuestion(startDate: Date = new Date(new Date().getTime() - WEEK_IN_MILLISECONDS)) {
  const mostUpvotedQuestions = await prisma.reaction.groupBy({
    where: {
      reactionType: "UPVOTE",
      createdAt: {
        gte: startDate
      },
      questionId: {
        not: null
      }
    },
    by: ["questionId"],
    _count: {
      questionId: true
    },
    orderBy: {
      _count: {
        questionId: "desc"
      }
    },
    take: 1 // get the most upvoted question
  });

  return mostUpvotedQuestions[0].questionId; // Return the top question or null if none found
}

export const deleteQuestion = async (privyUserId: string, questionId: number) => {
  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    },
    include: {
      replier: true
    }
  });

  if (question.repliedOn) {
    return { error: ERRORS.ALREADY_REPLIED };
  }

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  if (question.questionerId !== currentUser.id) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const res = await prisma.question.delete({
    where: {
      id: questionId
    }
  });

  return { data: res };
};

export const editQuestion = async (privyUserId: string, questionId: number, questionContent: string) => {
  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    },
    include: {
      replier: true
    }
  });

  if (question.repliedOn) {
    return { error: ERRORS.ALREADY_REPLIED };
  }

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  if (question.questionerId !== currentUser.id) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const res = await prisma.question.update({
    where: {
      id: questionId
    },
    data: {
      questionContent: questionContent
    }
  });

  return { data: res };
};

export const addReaction = async (privyUserId: string, questionId: number, reactionType: ReactionType) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });
  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    }
  });

  const isLike = reactionType === "LIKE";

  const res = prisma.$transaction(async tx => {
    //If the reacion is a Like, it means it's for the reply. Otherwise, it's for the question.
    //Logic can be improved later if needed
    const res = await tx.reaction.upsert({
      where: isLike
        ? {
            userId_replyId: {
              userId: user.id,
              replyId: question.id
            }
          }
        : {
            userId_questionId: {
              userId: user.id,
              questionId: question.id
            }
          },
      update: {
        reactionType: reactionType,
        replyId: isLike ? question.id : undefined,
        questionId: isLike ? undefined : question.id
      },
      create: {
        reactionType: reactionType,
        replyId: isLike ? question.id : undefined,
        questionId: isLike ? undefined : question.id,
        userId: user.id
      }
    });

    //Only send notification when not reacting to own question/
    const target = isLike ? question.replierId : question.questionerId;
    if (target && target !== user.id) {
      await sendNotification(
        target,
        isLike ? "REPLY_REACTION" : reactionType === "DOWNVOTE" ? "QUESTION_DOWNVOTED" : "QUESTION_UPVOTED",
        //We want to make it anonymous
        undefined,
        question.id,
        tx
      );
    }

    return res;
  });

  return { data: res };
};

export const deleteReaction = async (privyUserId: string, questionId: number, reactionType: ReactionType) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });
  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    }
  });

  //If the reacion is a Like, it means it's for the reply. Otherwise, it's for the question.
  //Logic can be improved later if needed
  const res = await prisma.reaction.delete({
    where:
      reactionType === "LIKE"
        ? {
            userId_replyId: {
              userId: user.id,
              replyId: question.id
            }
          }
        : {
            userId_questionId: {
              userId: user.id,
              questionId: question.id
            }
          }
  });

  return { data: res };
};

export const deleteReply = async (privyUserId: string, questionId: number) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });
  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    }
  });
  if (user.id !== question.replierId) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const res = await prisma.$transaction(async tx => {
    const res = await tx.question.update({
      where: {
        id: questionId
      },
      data: {
        repliedOn: null,
        reply: null
      }
    });

    //Make sure to delete reactions when deleting reply
    await tx.reaction.deleteMany({
      where: {
        replyId: questionId
      }
    });

    return res;
  });

  return { data: res };
};
