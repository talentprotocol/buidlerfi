import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { LoadingPage } from "@/components/shared/loadingPage";
import { useUserContext } from "@/contexts/userContext";
import { useCreateComment, useGetComments } from "@/hooks/useCommentApi";
import { HelpOutline } from "@mui/icons-material";
import { Button, Divider, IconButton, useTheme } from "@mui/joy";
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
  const theme = useTheme();
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
        <Flex x sx={{ minHeight: "100px" }} p={2}>
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
            <Flex>
              {hasLaunchedKeys && (
                <Button
                  sx={{ minWidth: "70px" }}
                  size="sm"
                  variant="outlined"
                  onClick={() => setIsGateAnswer(prev => !prev)}
                  color={isGateAnswer ? "danger" : "success"}
                >
                  {isGateAnswer ? "Gated" : "Open"}
                </Button>
              )}
              <IconButton sx={{ ml: 0.5 }} size="sm" onClick={() => setIsInfoModalOpen(true)}>
                <HelpOutline fontSize="small" htmlColor={theme.palette.neutral[600]} />
              </IconButton>
            </Flex>
          </Flex>
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
