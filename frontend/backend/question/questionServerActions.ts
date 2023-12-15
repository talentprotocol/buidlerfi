"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { ReactionType } from "@prisma/client";
import {
  addReaction,
  createQuestion,
  deleteQuestion,
  deleteReaction,
  deleteReply,
  editQuestion,
  getHotQuestions,
  getQuestion,
  getQuestions,
  getQuestionsArgs,
  getReactions
} from "./question";

export const getQuestionSA = async (questionId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => getQuestion(data.privyUserId, questionId), options);
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

export const getQuestionsSA = (args: getQuestionsArgs, options: ServerActionOptions) => {
  return serverActionWrapper(() => getQuestions(args, options.pagination?.offset || 0), options);
};

export const createQuestionSA = (questionContent: string, replierId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => createQuestion(data.privyUserId, questionContent, replierId), options);
};

export const deleteQuestionSA = async (questionId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => deleteQuestion(data.privyUserId, questionId), options);
};

export const editQuestionSA = async (questionId: number, questionContent: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => editQuestion(data.privyUserId, questionId, questionContent), options);
};

export const deleteReplySA = async (questionId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => deleteReply(data.privyUserId, questionId), options);
};

export const getHotQuestionsSA = (options: ServerActionOptions) => {
  return serverActionWrapper(() => getHotQuestions(options.pagination?.offset || 0), options);
};

export const getReactionsSA = async (questionId: number, type: "like" | "upvote", options: ServerActionOptions) => {
  return serverActionWrapper(() => getReactions(questionId, type), options);
};
