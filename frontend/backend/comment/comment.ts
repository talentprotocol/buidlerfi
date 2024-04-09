"use server";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { ReactionType } from "@prisma/client";
import { getKeyRelationships, hasLaunchedKeys, ownsKey } from "../keyRelationship/keyRelationship";
import { sendNotification } from "../notification/notification";

export const getComments = async (questionId: number, privyUserId?: string) => {
  const currentUser = privyUserId ? await prisma.user.findUnique({ where: { privyUserId } }) : undefined;
  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId } });

  //Not an open question. If question is gated, comments are also gated
  if (question.replierId && question.isGated) {
    const hasKey = await ownsKey({ userId: question.replierId }, { privyUserId });
    if (!hasKey) {
      return { error: ERRORS.MUST_HOLD_KEY, data: [] };
    }
  }

  const comments = await prisma.comment.findMany({
    where: { questionId },
    include: {
      author: true,
      reactions: true
    }
  });

  //If it's an open-question, exclude content of comments for which the user doesn't hold a key
  if (!question.replierId) {
    //If no current user, it means anonymous access
    const myKeys = currentUser ? await getKeyRelationships(currentUser.wallet, "holder") : { data: [] };
    const myKeysMap = myKeys.data.reduce((prev, curr) => ({ ...prev, [curr.ownerId]: true }), {});
    for (const comment of comments) {
      if (comment.isGated && !(comment.authorId in myKeysMap)) {
        comment.content = "";
      }
    }
  }

  return { data: comments };
};

export const createComment = async (privyUserId: string, questionId: number, comment: string, isGated?: boolean) => {
  if (comment.length < 5 || comment.length > MAX_COMMENT_LENGTH) {
    return { error: ERRORS.INVALID_LENGTH };
  }

  const question = await prisma.question.findUniqueOrThrow({ where: { id: questionId } });

  //Not an open question
  if (question.replierId) {
    if (!question.repliedOn) return { error: ERRORS.QUESTION_NOT_REPLIED };

    const hasKey = ownsKey({ userId: question.replierId }, { privyUserId });
    if (!hasKey) return { error: ERRORS.MUST_HOLD_KEY };
  }
  const isOpenQuestion = !question.replierId;
  const hasLaunchedKey = await hasLaunchedKeys({ privyUserId });

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });

  const res = await prisma.$transaction(async tx => {
    const newComment = await tx.comment.create({
      data: {
        content: comment,
        questionId,
        authorId: currentUser.id,
        //Can be gated if user has launched keys and is an open question
        isGated: !question.replierId && hasLaunchedKey ? isGated || false : false
      }
    });
    if (isOpenQuestion) {
      await sendNotification(question.questionerId, "REPLIED_YOUR_QUESTION", currentUser.id, question.id, tx);
    } else {
      await sendNotification(question.questionerId, "COMMENT", currentUser.id, question.id, tx);
    }
    return newComment;
  });
  return { data: res };
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
  //Must hold key to the question on which the comment is posted if it's not an open question
  const hasKey =
    (!comment.question.replierId && ownsKey({ userId: comment.authorId }, { privyUserId })) ||
    (comment.question.replierId && ownsKey({ userId: comment.question.replierId }, { privyUserId }));
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
      await sendNotification(comment.authorId, "LIKE_YOUR_COMMENT", currentUser.id, comment.questionId, tx);
      return newReaction;
    }
  });
  return { data: res };
};

export const getCommentsCount = async (questionId: number) => {
  const commentsCount = await prisma.comment.count({ where: { questionId } });
  return { data: commentsCount };
};

export const getReactions = async (commentId: number) => {
  const reactions = await prisma.reaction.findMany({
    where: { commentId }
  });

  return { data: reactions };
};
