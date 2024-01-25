import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { useUserContext } from "@/contexts/userContext";
import { useCreateComment, useGetComments } from "@/hooks/useCommentApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { Button, Divider } from "@mui/joy";
import { FC, useState } from "react";
import { ReplyCommentEntry } from "./reply-comment-entry";
import { TradeKeyModal } from "./trade-key-modal";

interface Props {
  questionId: number;
  isOpenQuestion: boolean;
  refetch: () => void;
}

export const CommentsList: FC<Props> = ({ questionId, isOpenQuestion }) => {
  const [newComment, setNewComment] = useState("");
  const postComment = useCreateComment();
  const { data: comments, refetch: refetchComment } = useGetComments(questionId);
  const { user: currentUser, refetch: refetchUserContext } = useUserContext();
  const [isBuyKeyModalOpen, setIsBuyKeyModalOpen] = useState(false);

  const handleCreateComment = async () => {
    await postComment
      .mutateAsync({
        questionId,
        comment: newComment
      })
      .then(() => {
        refetchComment();
        setNewComment("");
      });
  };

  if (!isOpenQuestion) {
    return (
      <Flex y>
        {comments?.map(comment => (
          <ReplyCommentEntry
            key={comment.id}
            id={comment.id}
            type="comment"
            content={comment.content}
            author={comment.author}
            createdAt={comment.createdAt}
            refetch={refetchComment}
          />
        ))}
      </Flex>
    );
  }

  return (
    <Flex y>
      {currentUser && isBuyKeyModalOpen && (
        <TradeKeyModal
          keyOwner={currentUser}
          supporterKeysCount={0}
          hasKeys={false}
          isFirstKey={false}
          side={"buy"}
          close={async () => {
            setIsBuyKeyModalOpen(false);
            await refetchUserContext();
          }}
        />
      )}
      <Flex x sx={{ minHeight: "100px" }} p={2}>
        <FullTextArea
          avatarUrl={currentUser?.avatarUrl ?? DEFAULT_PROFILE_PICTURE}
          placeholder={`Answer this open question`}
          onChange={e => setNewComment(e.target.value)}
          value={newComment}
        />
        <Button
          color="primary"
          sx={{ maxHeight: "20px", alignSelf: "flex-start" }}
          disabled={newComment.length < 10}
          loading={postComment.isLoading}
          onClick={handleCreateComment}
        >
          Answer
        </Button>
      </Flex>

      <Divider />
      <Flex y yc grow gap1>
        {comments?.map(comment => (
          <ReplyCommentEntry
            key={comment.id}
            id={comment.id}
            type="comment"
            content={comment.content}
            author={comment.author}
            createdAt={comment.createdAt}
            refetch={refetchComment}
          />
        ))}
      </Flex>
    </Flex>
  );
};
