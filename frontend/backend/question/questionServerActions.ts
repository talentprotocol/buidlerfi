"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { ReactionType } from "@prisma/client";
import { addReaction, createQuestion, deleteReaction, getQuestion, getQuestions } from "./question";

export const getQuestionSA = async (questionId: number, options: ServerActionOptions) => {
  return serverActionWrapper(() => getQuestion(questionId), options);
};

export const addReactionSA = async (questionId: number, reactionType: ReactionType, options: ServerActionOptions) => {
  return serverActionWrapper(data => addReaction(data.privyUserId, questionId, reactionType), options);
};

export const deleteReactionSA = async (
  questionId: number,
  reactionType: ReactionType,
  options: ServerActionOptions
) => {
  return serverActionWrapper(data => deleteReaction(data.privyUserId, questionId, reactionType), options);
};

export const getQuestionsSA = (userId: number, options: ServerActionOptions) => {
  return serverActionWrapper(() => getQuestions(userId), options);
};

export const createQuestionSA = (questionContent: string, replierId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => createQuestion(data.privyUserId, questionContent, replierId), options);
};
