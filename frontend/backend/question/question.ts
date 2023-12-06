"use server";

import { publishNewQuestionCast } from "@/lib/api/backend/farcaster";
import { fetchHolders } from "@/lib/api/common/builderfi";
import { MIN_QUESTION_LENGTH } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import { exclude } from "@/lib/exclude";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { ReactionType, SocialProfileType } from "@prisma/client";

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

  const question = await prisma.question.create({
    data: { questionerId: questioner.id, replierId: replier.id, questionContent: questionContent }
  });
  // if in production, push the question to farcaster
  if (process.env.ENABLE_FARCASTER === "true") {
    const questionerFarcaster = questioner.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
    const replierFarcaster = replier.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);

    if (questionerFarcaster || replierFarcaster) {
      const replierName = replierFarcaster?.profileName
        ? `@${replierFarcaster?.profileName}`
        : replier.displayName || shortAddress(replier.wallet || "");
      const questionerName = questionerFarcaster?.profileName
        ? `@${questionerFarcaster?.profileName}`
        : questioner?.displayName || shortAddress(questioner?.wallet || "");
      // if one of the two has farcaster, publish the cast
      publishNewQuestionCast(
        questionerName,
        replierName,
        `https://app.builder.fi/profile/${replier.wallet}?question=${question.id}`
      );
    }
  }
  return { data: question };
};

export const getQuestions = async (userId: number) => {
  const questions = await prisma.question.findMany({
    where: {
      replierId: userId
    },
    include: {
      questioner: true,
      replier: true,
      reactions: true,
      replyReactions: true
    },
    orderBy: {
      id: "desc"
    }
  });

  return { data: exclude(questions, ["reply"]) };
};

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

    //Make sure to delete reactions when deleting question
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
