import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { LoadingPage } from "@/components/shared/loadingPage";
import { useUserContext } from "@/contexts/userContext";
import { useCreateComment, useGetComments } from "@/hooks/useCommentApi";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import { FC, useState } from "react";
import { GateAnswerHelpModal } from "../question/gate-answer-help-modal";
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
  const { data: comments, refetch: refetchComment, isLoading } = useGetComments(questionId);
  const {
    user: currentUser,
    refetch: refetchUserContext,
    isAuthenticatedAndActive,
    hasLaunchedKeys
  } = useUserContext();
  const [isBuyKeyModalOpen, setIsBuyKeyModalOpen] = useState(false);
  const [isGateAnswer, setIsGateAnswer] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleCreateComment = async () => {
    await postComment
      .mutateAsync({
        questionId,
        comment: newComment,
        isGated: isGateAnswer
      })
      .then(() => {
        refetchComment();
        setNewComment("");
      });
  };

  if (!isOpenQuestion) {
    return (
      <Flex y grow>
        {isLoading ? (
          <LoadingPage />
        ) : (
          comments?.map(comment => (
            <ReplyCommentEntry
              key={comment.id}
              id={comment.id}
              type="comment"
              content={comment.content}
              author={comment.author}
              createdAt={comment.createdAt}
              refetch={refetchComment}
            />
          ))
        )}
      </Flex>
    );
  }

  return (
    <Flex y grow>
      {isInfoModalOpen && <GateAnswerHelpModal close={() => setIsInfoModalOpen(false)} />}
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
      {isAuthenticatedAndActive && (
        <Flex y p={2} gap3>
          <Flex x sx={{ minHeight: "100px" }}>
            <FullTextArea
              avatarUrl={currentUser?.avatarUrl || undefined}
              placeholder={`Answer this open question`}
              onChange={e => setNewComment(e.target.value)}
              value={newComment}
            />
            <Flex y gap={1}>
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
          </Flex>
          {hasLaunchedKeys && (
            <Checkbox
              label="Gate this answer to be visible to your key holders only."
              size="sm"
              checked={isGateAnswer}
              onChange={e => setIsGateAnswer(e.target.checked)}
            />
          )}
        </Flex>
      )}
      <Divider />
      <Flex y gap1 grow>
        {isLoading ? (
          <LoadingPage />
        ) : (
          comments?.map(comment => (
            <ReplyCommentEntry
              key={comment.id}
              id={comment.id}
              type="comment"
              content={comment.content}
              author={comment.author}
              createdAt={comment.createdAt}
              refetch={refetchComment}
            />
          ))
        )}
      </Flex>
    </Flex>
  );
};
