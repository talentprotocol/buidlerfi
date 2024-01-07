"use server";
import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { addReaction, createComment, deleteComment, editComment } from "./comment";

export const addReactionSA = async (commentId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => addReaction(data.privyUserId, commentId), options);
};

export const createCommentSA = async (questionId: number, comment: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => createComment(data.privyUserId, questionId, comment), options);
};

export const editCommentSA = async (commentId: number, comment: string, options: ServerActionOptions) => {
  return serverActionWrapper(data => editComment(data.privyUserId, commentId, comment), options);
};

export const deleteCommentSA = async (commentId: number, options: ServerActionOptions) => {
  return serverActionWrapper(data => deleteComment(data.privyUserId, commentId), options);
};
