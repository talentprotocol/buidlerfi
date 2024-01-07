"use server";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { ReactionType } from "@prisma/client";
import { ownsKey } from "../keyRelationship/keyRelationship";

export const getComments = async (privyUserId: string, questionId: number) => {
  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
  if (!question.repliedOn) {
    return { data: [] };
  }
  const hasKey = ownsKey({ userId: question.replierId }, { privyUserId });
  if (!hasKey) {
    return { error: ERRORS.MUST_HOLD_KEY, data: [] };
  }

  const comments = await prisma.comment.findMany({
    where: { questionId },
    include: {
      author: true,
      reactions: true
    }
  });

  return { data: comments };
};

export const createComment = async (privyUserId: string, questionId: number, comment: string) => {
  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
  if (!question.repliedOn) {
    return { error: ERRORS.QUESTION_NOT_REPLIED };
  }
  const hasKey = ownsKey({ userId: question.replierId }, { privyUserId });
  if (!hasKey) {
    return { error: ERRORS.MUST_HOLD_KEY };
  }

  if (comment.length < 5 || comment.length > MAX_COMMENT_LENGTH) {
    return { error: ERRORS.INVALID_LENGTH };
  }

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  const newComment = await prisma.comment.create({
    data: {
      content: comment,
      questionId,
      authorId: currentUser.id
    }
  });

  return { data: newComment };
};

export const editComment = async (privyUserId: string, commentId: number, comment: string) => {
  const commentToEdit = await prisma.comment.findUniqueOrThrow({ where: { id: commentId }, include: { author: true } });
  if (commentToEdit.author.privyUserId !== privyUserId) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  if (comment.length < 5 || comment.length > MAX_COMMENT_LENGTH) {
    return { error: ERRORS.INVALID_LENGTH };
  }

  const editedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: comment }
  });

  return { data: editedComment };
};

export const deleteComment = async (privyUserId: string, commentId: number) => {
  const commentToDelete = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: { author: true }
  });
  if (commentToDelete.author.privyUserId !== privyUserId) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const res = await prisma.$transaction(async tx => {
    await tx.reaction.deleteMany({
      where: {
        commentId
      }
    });

    const deletedComment = await tx.comment.delete({
      where: { id: commentId }
    });

    return deletedComment;
  });

  return { data: res };
};

export const addReaction = async (privyUserId: string, commentId: number) => {
  const comment = await prisma.comment.findUniqueOrThrow({ where: { id: commentId }, include: { question: true } });
  //Must hold key to the question on which the comment is posted
  const hasKey = ownsKey({ userId: comment.question.replierId }, { privyUserId });
  if (!hasKey) {
    return { error: ERRORS.MUST_HOLD_KEY };
  }

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  const res = await prisma.$transaction(async tx => {
    const existingReaction = await tx.reaction.findFirst({
      where: {
        commentId,
        userId: currentUser.id
      }
    });

    if (existingReaction) {
      //If already liked, delete the like
      await tx.reaction.delete({
        where: {
          id: existingReaction?.id
        }
      });
      return existingReaction;
    } else {
      const newReaction = await tx.reaction.create({
        data: {
          commentId,
          userId: currentUser.id,
          reactionType: ReactionType.LIKE
        }
      });
      return newReaction;
    }
  });

  return { data: res };
};
