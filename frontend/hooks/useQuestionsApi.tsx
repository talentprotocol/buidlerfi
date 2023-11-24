import {
  addReactionSA,
  createQuestionSA,
  deleteReactionSA,
  getQuestionSA,
  getQuestionsSA
} from "@/backend/question/questionServerActions";
import { ReactionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export const useGetQuestion = (id?: number) => {
  return useQuerySA(["useGetQuestion", id], options => getQuestionSA(id!, options), {
    enabled: !!id
  });
};

export const useGetQuestions = (userId?: number) => {
  return useQuerySA(
    ["useGetQuestions", userId],
    options => getQuestionsSA(userId!, options),

    { enabled: !!userId }
  );
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
