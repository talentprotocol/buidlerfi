"use server";

import { publishNewQuestionCast } from "@/lib/api/backend/farcaster";
import { fetchHolders } from "@/lib/api/common/builderfi";
import { MIN_QUESTION_LENGTH, PAGINATION_LIMIT } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { exclude } from "@/lib/exclude";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { Prisma, ReactionType, SocialProfileType } from "@prisma/client";
import { sendNotification } from "../notification/notification";

export const createQuestion = async (privyUserId: string, questionContent: string, replierId: number) => {
  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  const questioner = await prisma.user.findUniqueOrThrow({ where: { privyUserId }, include: { socialProfiles: true } });
  const replier = await prisma.user.findUniqueOrThrow({ where: { id: replierId }, include: { socialProfiles: true } });

  const replierHolders = await fetchHolders(replier.wallet);
  const found = replierHolders.find(holder => holder.holder.owner.toLowerCase() === questioner.wallet.toLowerCase());
  if (!found || Number(found.heldKeyNumber) === 0) {
    return { error: ERRORS.MUST_HOLD_KEY };
  }

  const question = await prisma.$transaction(async tx => {
    const question = await tx.question.create({
      data: { questionerId: questioner.id, replierId: replier.id, questionContent: questionContent }
    });
    await sendNotification(replier.id, questioner.id, "ASKED_QUESTION", question.id, tx);

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
      const replierName = replierFarcaster?.profileName
        ? `@${replierFarcaster?.profileName}`
        : replier.displayName || shortAddress(replier.wallet || "");
      const questionerName = questionerFarcaster?.profileName
        ? `@${questionerFarcaster?.profileName}`
        : questioner?.displayName || shortAddress(questioner?.wallet || "");
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
  };
}>;

export async function getHotQuestions(offset: number) {
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
      AS net_upvotes
    FROM
      "Question" AS q
  	LEFT JOIN
      "User" AS "replier" ON q."replierId" = replier.id
    LEFT JOIN
      "User" AS "questioner" ON q."questionerId" = questioner.id
    LEFT JOIN
      "Reaction" AS r ON q.id = r."questionId"
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
      }
    };
    return question;
  });

  return { data: transformedResults };
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
      replier: true
    },
    take: PAGINATION_LIMIT,
    orderBy: args.orderBy,
    skip: offset
  });

  return { data: exclude(questions, ["reply"]) };
}

export const getQuestion = async (privyUserId: string, questionId: number) => {
  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId
    },
    include: {
      reactions: true,
      questioner: true,
      replier: true,
      replyReactions: true
    }
  });

  const replierHolders = await fetchHolders(question.replier.wallet.toLowerCase());
  const found = replierHolders.find(holder => holder.holder.owner.toLowerCase() === currentUser.wallet.toLowerCase());

  if (found && Number(found.heldKeyNumber) > 0) return { data: question };
  else return { data: exclude(question, ["reply"]) };
};

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
    const res = await prisma.question.delete({
      where: {
        id: questionId
      }
    });

    // Make sure to delete reactions when deleting question
    await tx.reaction.deleteMany({
      where: {
        questionId: questionId
      }
    });
    return res;
  });

  return { data: res };
};

export const editQuestion = async (privyUserId: string, questionId: number, questionContent: string) => {
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
    if (target !== user.id) {
      await sendNotification(
        target,
        user.id,
        isLike ? "REPLY_REACTION" : reactionType === "DOWNVOTE" ? "QUESTION_DOWNVOTED" : "QUESTION_UPVOTED",
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
