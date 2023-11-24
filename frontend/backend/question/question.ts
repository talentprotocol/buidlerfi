"use server";

import { fetchHolders } from "@/lib/api/common/builderfi";
import { MIN_QUESTION_LENGTH } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { ReactionType } from "@prisma/client";

export const createQuestion = async (privyUserId: string, questionContent: string, replierId: number) => {
  if (questionContent.length > 280 || questionContent.length < MIN_QUESTION_LENGTH) {
    return { error: ERRORS.QUESTION_LENGTH_INVALID };
  }

  const questioner = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });
  const replier = await prisma.user.findUniqueOrThrow({ where: { id: replierId } });

  const replierHolders = await fetchHolders(replier.wallet);
  const found = replierHolders.find(holder => holder.holder.owner.toLowerCase() === questioner.wallet.toLowerCase());
  if (!found || Number(found.heldKeyNumber) === 0) {
    return { error: ERRORS.MUST_HOLD_KEY };
  }

  const question = await prisma.question.create({
    data: { questionerId: questioner.id, replierId: replier.id, questionContent: questionContent }
  });

  return { data: question };
};

export const getQuestions = async (userId: number) => {
  return {
    data: await prisma.question.findMany({
      where: {
        replierId: userId
      },
      include: {
        questioner: true,
        replier: true,
        reactions: true,
        replyReactions: true
      }
    })
  };
};

export const getQuestion = async (questionId: number) => {
  const res = await prisma.question.findUnique({
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

  if (!res) return { error: ERRORS.QUESTION_NOT_FOUND };

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

  //If the reacion is a Like, it means it's for the reply. Otherwise, it's for the question.
  //Logic can be improved later if needed
  const res = await prisma.reaction.upsert({
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
