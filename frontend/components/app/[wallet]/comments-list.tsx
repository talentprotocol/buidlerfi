import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { useUserContext } from "@/contexts/userContext";
import { useCreateComment, useGetComments } from "@/hooks/useCommentApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { Button, Checkbox, Divider } from "@mui/joy";
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
  const [gated, setGated] = useState(true);

  const handleCreateComment = async () => {
    await postComment
      .mutateAsync({
        questionId,
        comment: newComment,
        gated
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
      <Flex y p={2} gap1>
        <Flex x sx={{ minHeight: "100px" }}>
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
        <Checkbox
          label="Gate this response to your key holders only."
          size="sm"
          checked={gated}
          onChange={e => setGated(e.target.checked)}
        />
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
