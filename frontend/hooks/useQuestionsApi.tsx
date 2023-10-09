import { ApiResponse } from "@/models/apiResponse.model";
import { Question } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetQuestions = (replierWallet?: string, questionerWallet?: string) => {
  return useQuery(
    ["useGetQuestions", questionerWallet, replierWallet],
    () =>
      axios
        .get<ApiResponse<Question[]>>(`/api/questions`, { params: { questionerWallet, replierWallet } })
        .then(res => res.data.data),
    { enabled: !!replierWallet }
  );
};

interface PostQuestionParams {
  questionContent: string;
  questionerWallet: string;
  replierWallet: string;
}

export const usePostQuestion = () => {
  return useMutation((params: PostQuestionParams) => {
    return axios.post("/api/questions", params);
  });
};

interface PutQuestionParams {
  id: number;
  answerContent: string;
}

export const usePutQuestion = () => {
  return useMutation((params: PutQuestionParams) => {
    return axios.put(`/questions/${params.id}`, { answerContent: params.answerContent });
  });
};
