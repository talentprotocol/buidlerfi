import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Question {
  id: number;
  questionContent: string;
  answerContent: string | null;
  createdAt: Date;
  questionerWallet: string;
  replierWallet: string;
}

interface ResponseData {
  data: Question[];
}

export const useGetQuestions = (questionerWallet?: string, replierWallet?: string) => {
  return useQuery(
    ["useGetQuestions", questionerWallet, replierWallet],
    () =>
      axios
        .get<ResponseData>(`/api/questions`, {
          params: { questionerWallet, replierWallet }
        })
        .then(res => res.data.data),
    { enabled: !!questionerWallet && !!replierWallet }
  );
};

interface PostQuestionParams {
  questionContent: string;
  questionerWallet?: string;
  replierWallet?: string;
}

export const usePostQuestion = () => {
  return useMutation((params: PostQuestionParams) => {
    return axios.post("/api/questions", params);
  });
};
