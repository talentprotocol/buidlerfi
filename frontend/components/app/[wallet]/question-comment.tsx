import { Flex } from "@/components/shared/flex";
import { useGetComments } from "@/hooks/useCommentApi";
import { FC } from "react";
import { CommentEntry } from "./comment-entry";

interface Props {
  questionId: number;
}

export const QuestionComment: FC<Props> = ({ questionId }) => {
  const { data: comments, refetch: refetchComments } = useGetComments(questionId);

  return (
    <Flex y gap2 p={!comments?.length ? 0 : 2}>
      {comments?.map(comment => (
        <CommentEntry key={comment.id} comment={comment} refetch={refetchComments} />
      ))}
    </Flex>
  );
};
