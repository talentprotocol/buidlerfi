import { getQuestionsArgs } from "@/backend/question/question";
import {
  addReactionSA,
  createQuestionSA,
  deleteQuestionSA,
  deleteReactionSA,
  deleteReplySA,
  editQuestionSA,
  getHotQuestionsSA,
  getQuestionSA,
  getQuestionsSA,
  getReactionsSA
} from "@/backend/question/questionServerActions";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { ReactionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useInfiniteQuerySA } from "./useInfiniteQuerySA";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export function useGetQuestion(id: number, queryOptions?: SimpleUseQueryOptions) {
  return useQuerySA(["useGetQuestion", id], options => getQuestionSA(id!, options), {
    ...queryOptions
  });
}

export const useGetQuestions = (args: getQuestionsArgs, queryOptions?: SimpleUseQueryOptions) => {
  return useInfiniteQuerySA(["useGetQuestions", args], options => getQuestionsSA(args, options), {
    enabled: !!args,
    ...queryOptions
  });
};

export const usePostQuestion = () => {
  return useMutationSA((options, params: { replierId: number; questionContent: string }) =>
    createQuestionSA(params.questionContent, params.replierId, options)
  );
};

interface PutQuestionParams {
  id: number;
  answerContent: string;
}

export const usePutQuestion = () => {
  const axios = useAxios();
  return useMutation((params: PutQuestionParams) => {
    return axios.put(`/api/questions/${params.id}`, params);
  });
};

export const useAddReaction = () => {
  return useMutationSA((options, params: { questionId: number; reactionType: ReactionType }) =>
    addReactionSA(params.questionId, params.reactionType, options)
  );
};

export const useDeleteReaction = () => {
  return useMutationSA((options, params: { questionId: number; reactionType: ReactionType }) =>
    deleteReactionSA(params.questionId, params.reactionType, options)
  );
};

export const useDeleteQuestion = () => {
  return useMutationSA((options, questionId: number) => deleteQuestionSA(questionId, options));
};

export const useEditQuestion = () => {
  return useMutationSA((options, params: { questionId: number; questionContent: string }) =>
    editQuestionSA(params.questionId, params.questionContent, options)
  );
};

export const useDeleteReply = () => {
  return useMutationSA((options, questionId: number) => deleteReplySA(questionId, options));
};

export const useGetHotQuestions = (queryOptions: SimpleUseQueryOptions) => {
  return useInfiniteQuerySA(["useGetHotQuestions"], options => getHotQuestionsSA(options), queryOptions);
};

export const useGetReactions = (questionId: number, type: "like" | "upvote") => {
  return useQuerySA(["useGetReactions", questionId, type], options => getReactionsSA(questionId, type, options));
};
