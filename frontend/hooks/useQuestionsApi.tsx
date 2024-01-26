import { getHotQuestions, getQuestions, getReactions } from "@/backend/question/question";
import {
  addReactionSA,
  createOpenQuestionSA,
  createQuestionSA,
  deleteQuestionSA,
  deleteReactionSA,
  deleteReplySA,
  editQuestionSA,
  getQuestionSA
} from "@/backend/question/questionServerActions";
import { SimpleUseQueryOptions } from "@/models/helpers.model";
import { ReactionType, RecommendedUser } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export function useGetQuestion(id: number, queryOptions?: SimpleUseQueryOptions) {
  return useQuerySA(["useGetQuestion", id], options => getQuestionSA(id!, options), {
    ...queryOptions
  });
}

export function useGetOpenQuestions() {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getQuestions>>>(["useGetOpenQuestions"], "/api/question/open");
}

export const useGetNewQuestions = () => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getQuestions>>>(["useGetNewQuestions"], "/api/question/new");
};

export const useGetKeyQuestions = () => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getQuestions>>>(["useGetKeyQuestions"], "/api/question/keys");
};

export const useGetQuestionsFromUser = (userId?: number, side: "questions" | "replies" = "replies") => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getQuestions>>>(
    ["useGetQuestionsFromUser", userId, side],
    "/api/question/user",
    { enabled: !!userId },
    { user: userId, side }
  );
};

export const usePostQuestion = () => {
  return useMutationSA(
    (options, params: { replierId: number; questionContent: string; recommendedUser: RecommendedUser }) =>
      createQuestionSA(params.questionContent, params.replierId, params.recommendedUser, options)
  );
};
export const usePostOpenQuestion = () => {
  return useMutationSA((options, params: { questionContent: string; tag: string }) =>
    createOpenQuestionSA(params.questionContent, params.tag, options)
  );
};

interface PutQuestionParams {
  id: number;
  answerContent: string;
}

export const usePutQuestion = () => {
  const axios = useAxios();
  return useMutation((params: PutQuestionParams) => {
    return axios.put(`/api/question/${params.id}`, params);
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

export const useGetHotQuestions = () => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getHotQuestions>>>(
    ["useGetHotQuestions"],
    "/api/question/hot"
  );
};

export const useGetReactions = (questionId: number, type: "like" | "upvote") => {
  const axios = useAxios();
  return useQuery(["useGetReactions", questionId, type], async () =>
    axios
      .get<ReturnType<typeof getReactions>>("/api/reaction", {
        params: { questionId, type }
      })
      .then(res => res.data)
      .then(res => res.data)
  );
};
