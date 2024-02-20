import { getComments, getCommentsCount, getReactions } from "@/backend/comment/comment";
import { addReactionSA, createCommentSA, deleteCommentSA, editCommentSA } from "@/backend/comment/commentServerActions";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";
import { useMutationSA } from "./useMutationSA";

export const useGetComments = (questionId?: number) => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getComments>>>(
    ["useGetComments", questionId],
    "/api/comment",
    { enabled: !!questionId },
    { questionId: questionId }
  );
};

export const useCreateComment = () => {
  return useMutationSA((options, params: { questionId: number; comment: string; isGated?: boolean }) =>
    createCommentSA(params, options)
  );
};

export const useEditComment = () => {
  return useMutationSA((options, params: { commentId: number; comment: string }) =>
    editCommentSA(params.commentId, params.comment, options)
  );
};

export const useAddCommentReaction = () => {
  return useMutationSA((options, commentId: number) => addReactionSA(commentId, options));
};

export const useDeleteComment = () => {
  return useMutationSA((options, commentId: number) => deleteCommentSA(commentId, options));
};

export const useGetCommentsCount = (questionId?: number, enabled?: boolean) => {
  const axios = useAxios();
  return useQuery(
    ["useGetCommentsCount", questionId],
    () =>
      axios
        .get<ReturnType<typeof getCommentsCount>>("/api/comment/count", { params: { questionId } })
        .then(res => res.data)
        .then(res => res.data),
    { enabled: enabled && !!questionId }
  );
};

export const useGetCommentReactions = (commentId?: number) => {
  const axios = useAxios();
  return useQuery(
    ["useGetCommentReactions", commentId],
    () =>
      axios
        .get<ReturnType<typeof getReactions>>("/api/reaction/comment", { params: { commentId } })
        .then(res => res.data)
        .then(res => res.data),
    { enabled: !!commentId }
  );
};
