import { getComments } from "@/backend/comment/comment";
import { addReactionSA, createCommentSA, deleteCommentSA, editCommentSA } from "@/backend/comment/commentServerActions";
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
  return useMutationSA((options, params: { questionId: number; comment: string }) =>
    createCommentSA(params.questionId, params.comment, options)
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
