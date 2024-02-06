import { getHotQuestions, getQuestion, getQuestions, getReactions } from "@/backend/question/question";
import {
  addReactionSA,
  answerQuestionSA,
  createOpenQuestionSA,
  createQuestionSA,
  deleteQuestionSA,
  deleteReactionSA,
  deleteReplySA,
  editQuestionSA
} from "@/backend/question/questionServerActions";
import { ReactionType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";
import { useMutationSA } from "./useMutationSA";

export function useGetQuestion(id: number) {
  const axios = useAxios();
  return useQuery(["useGetQuestion", id], async () =>
    axios
      .get<Awaited<ReturnType<typeof getQuestion>>>(`/api/question/${id}`)
      .then(res => res.data)
      .then(res => res.data)
  );
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
  return useMutationSA((options, params: { replierId: number; questionContent: string }) =>
    createQuestionSA(params.questionContent, params.replierId, options)
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
  isGated: boolean | undefined;
}

export const usePutQuestion = () => {
  return useMutationSA((options, params: PutQuestionParams) =>
    answerQuestionSA(params.id, params.answerContent, params.isGated, options)
  );
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
