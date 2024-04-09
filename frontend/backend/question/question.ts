"use server";

import { getFarcasterProfileName, publishNewAnswerCast, publishNewQuestionCast } from "@/lib/api/backend/farcaster";
import { MAX_COMMENT_LENGTH, MIN_QUESTION_LENGTH, PAGINATION_LIMIT, WEEK_IN_MILLISECONDS } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { exclude } from "@/lib/exclude";
import prisma from "@/lib/prisma";
import {
  KeyRelationship,
  NotificationType,
  Prisma,
  ReactionType,
  RecommendedUser,
  SocialProfile,
  SocialProfileType,
  User
} from "@prisma/client";
import differenceInMinutes from "date-fns/differenceInMinutes";
import { getKeyRelationships, ownsKey } from "../keyRelationship/keyRelationship";
import { sendNotification } from "../notification/notification";

export const createQuestion = async (
  privyUserId: string,
  questionContent: string,
  replierId?: number,
  recommendedUser?: RecommendedUser
) => {
  const lastQuestion = await prisma.question.findFirst({
    where: {
      questioner: {
        privyUserId
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (lastQuestion && differenceInMinutes(new Date(), lastQuestion.createdAt) < 1) {
    return { error: ERRORS.QUESTION_TOO_SOON };
  }

  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  const questioner = await prisma.user.findUniqueOrThrow({
    where: { privyUserId },
    include: { socialProfiles: true, keysOwned: true }
  });

  let replier: (User & { keysOfSelf?: KeyRelationship[]; socialProfiles: SocialProfile[] }) | null;
  if (!replierId && recommendedUser) {
    replier = await prisma.user.findUnique({
      where: { socialWallet: recommendedUser.wallet.toLowerCase() },
      include: { socialProfiles: true, keysOfSelf: true }
    });
    if (!replier) {
      replier = await prisma.user.create({
        data: {
          displayName:
            recommendedUser.talentProtocol || recommendedUser.ens || recommendedUser.farcaster || recommendedUser.lens,
          avatarUrl: recommendedUser.avatarUrl,
          socialWallet: recommendedUser.wallet.toLowerCase(),
          wallet: "",
          socialProfiles: {
            create: {
              type: SocialProfileType.FARCASTER,
              profileName: recommendedUser.farcaster!,
              profileImage: recommendedUser.avatarUrl
            }
          }
        },
        include: {
          socialProfiles: true
        }
      });
    }
  } else {
    replier = await prisma.user.findUniqueOrThrow({
      where: { id: replierId },
      include: { socialProfiles: true, keysOfSelf: true }
    });
  }

  if (!replier) {
    return { error: ERRORS.USER_NOT_FOUND };
  }

  if (replier.keysOfSelf && replier.keysOfSelf.length > 0) {
    const key = questioner.keysOwned.find(key => key.ownerId === replierId);
    if (replier.isGated && (!key || key.amount === BigInt(0))) {
      return { error: ERRORS.MUST_HOLD_KEY };
    }
  }

  const question = await prisma.$transaction(async tx => {
    const question = await tx.question.create({
      data: { questionerId: questioner.id, replierId: replier!.id, questionContent: questionContent }
    });
    await sendNotification(replier!.id, "ASKED_QUESTION", questioner.id, question.id, tx);

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
      await publishNewQuestionCast(questionerName, replierName, `https://app.builder.fi/question/${question.id}`);
    }
  }
  return { data: question };
};

export const createOpenQuestion = async (privyUserId: string, questionContent: string, tag?: string) => {
  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  const lastQuestion = await prisma.question.findFirst({
    where: {
      questioner: {
        privyUserId
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (lastQuestion) console.log(differenceInMinutes(new Date(), lastQuestion.createdAt));
  if (lastQuestion && differenceInMinutes(new Date(), lastQuestion.createdAt) < 1) {
    return { error: ERRORS.QUESTION_TOO_SOON };
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
    questionerId: true;
    replierId: true;
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
      questionerId: row.questionerId,
      replierId: row.replierId,
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
export const getQuestion = async (
  questionId: number,
  privyUserId?: string,
  includeSocialProfiles: boolean = false,
  includeTags: boolean = false
) => {
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
      ...(includeTags && {
        tags: true
      }),
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

  //If not gated, or is an open-question, return immediately
  //If user has not launched keys, gated will always be false, so we don't need to check if key is launched
  if (!question.isGated || !question.replierId) return { data: question };

  if (!privyUserId) {
    return { data: exclude(question, ["reply"]) };
  }

  const hasKey = await ownsKey({ userId: question.replierId }, { privyUserId });
  return { data: hasKey ? question : exclude(question, ["reply"]) };
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

  const res = await prisma.$transaction(async tx => {
    const res = await tx.question.delete({
      where: {
        id: questionId
      }
    });

    //When a question is deleted, delete all notifications associated to that question
    await tx.notification.deleteMany({
      where: {
        OR: [
          { type: NotificationType.ASKED_QUESTION },
          { type: NotificationType.REPLIED_YOUR_QUESTION },
          { type: NotificationType.QUESTION_DOWNVOTED },
          { type: NotificationType.QUESTION_UPVOTED },
          { type: NotificationType.REPLY_REACTION },
          { type: NotificationType.NEW_OPEN_QUESTION }
        ],
        referenceId: questionId
      }
    });

    return res;
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

export const answerQuestion = async (
  privyUserId: string,
  questionId: number,
  answerContent: string,
  isGated: boolean | undefined
) => {
  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId } });

  if (answerContent.length < 5 || answerContent.length > MAX_COMMENT_LENGTH) return { error: ERRORS.INVALID_LENGTH };

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { privyUserId },
    include: { socialProfiles: true, keysOfSelf: { where: { amount: { gt: 0 } } } }
  });

  const hasLaunchedKeys = !!currentUser.keysOfSelf.find(h => h.holderId === h.ownerId);

  if (question.replierId !== currentUser?.id) return { error: ERRORS.UNAUTHORIZED };

  const res = await prisma.$transaction(async tx => {
    const question = await tx.question.update({
      where: { id: questionId },
      data: {
        reply: answerContent,
        repliedOn: new Date(),
        //Cannot gate if keys not launched
        isGated: hasLaunchedKeys ? isGated : false
      }
    });
    await sendNotification(question.questionerId, "REPLIED_YOUR_QUESTION", currentUser.id, question.id, tx);
    return question;
  });

  console.log("Farcaster enabled -> ", process.env.ENABLE_FARCASTER);
  if (process.env.ENABLE_FARCASTER === "true") {
    const questioner = await prisma.user.findUnique({
      where: { id: question.questionerId },
      include: { socialProfiles: true }
    });
    const questionerFarcaster = questioner?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    const replierFarcaster = currentUser?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);

    console.log("FOUND questioner -> ", !!questionerFarcaster);
    console.log("FOUND replier -> ", !!replierFarcaster);

    if (questionerFarcaster || replierFarcaster) {
      const replierName = getFarcasterProfileName(currentUser!, replierFarcaster);
      const questionerName = getFarcasterProfileName(questioner!, questionerFarcaster);
      // if one of the two has farcaster, publish the cast
      console.log("CASTING NEW ANSWER");
      await publishNewAnswerCast(
        replierName,
        questionerName,
        `https://app.builder.fi/question/${question.id}?isReply=true`
      );
    }
  }

  return { data: res };
};

//Get all answers from a user including open questions
//Open question answers are comments in the DB
export const getUserAnswers = async (userId: number, offset = 0) => {
  const res = await prisma.question.findMany({
    where: {
      OR: [{ replierId: userId, repliedOn: { not: null } }, { comments: { some: { authorId: userId } } }]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      questioner: true,
      replier: true,
      tags: true
    },
    take: PAGINATION_LIMIT,
    skip: offset
  });

  return { data: exclude(res, ["reply"]) };
};

export const SearchQuestions = async (search: string, offset: number) => {
  const res = await prisma.question.findMany({
    where: {
      questionContent: {
        contains: search,
        mode: "insensitive" // Make search case insensitive
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

  return { data: exclude(res, ["reply"]) };
};
