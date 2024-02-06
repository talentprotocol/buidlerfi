"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { ReactionType } from "@prisma/client";
import {
  addReaction,
  answerQuestion,
  createOpenQuestion,
  createQuestion,
  deleteQuestion,
  deleteReaction,
  deleteReply,
  editQuestion,
  getHotQuestions,
  getQuestion,
  getReactions
} from "./question";

export const getQuestionSA = async (questionId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => getQuestion(questionId, data.privyUserId), options);
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

export const createQuestionSA = (questionContent: string, replierId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => createQuestion(data.privyUserId, questionContent, replierId), options);
};

export const createOpenQuestionSA = (questionContent: string, tag: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => createOpenQuestion(data.privyUserId, questionContent, tag), options);
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

export const answerQuestionSA = async (
  questionId: number,
  answer: string,
  isGated: boolean | undefined,
  options: ServerActionOptions
) => {
  return serverActionWrapper(data => answerQuestion(data.privyUserId, questionId, answer, isGated), options);
};
