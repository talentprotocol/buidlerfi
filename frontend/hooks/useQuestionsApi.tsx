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

export const useGetQuestions = (questionerWallet?: string, replierWallet?: string) => {
  return useQuery(
    ["useGetQuestions", questionerWallet, replierWallet],
    () =>
      axios
        .get<Question[]>(`/api/questions`, {
          params: { questionerWallet, replierWallet }
        })
        .then(res => res.data),
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
