import { ApiResponse } from "@/models/apiResponse.model";
import { Prisma } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";

export type GetQuestionsResponse = Prisma.QuestionGetPayload<{
  include: { questioner: true; reactions: true; comments: true };
}>;

export const useGetQuestions = (replierWallet?: string, questionerWallet?: string) => {
  const axios = useAxios();
  return useQuery(
    ["useGetQuestions", questionerWallet, replierWallet],
    () =>
      axios
        .get<ApiResponse<GetQuestionsResponse[]>>(`/api/questions`, { params: { questionerWallet, replierWallet } })
        .then(res => res.data.data),
    { enabled: !!replierWallet }
  );
};

interface PostQuestionParams {
  questionContent: string;
  replierWallet: string;
}

export const usePostQuestion = () => {
  const axios = useAxios();
  return useMutation((params: PostQuestionParams) => {
    return axios.post("/api/questions", params);
  });
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
