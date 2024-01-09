"use client";

import { AddCommentButton } from "@/components/shared/add-comment-button";
import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { Reactions } from "@/components/shared/reactions";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useGetQuestion, usePutQuestion } from "@/hooks/useQuestionsApi";
import { useGetUserStats } from "@/hooks/useUserApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { getDifference } from "@/lib/utils";
import { FileUploadOutlined, LockOutlined } from "@mui/icons-material";
import { Avatar, Button, Divider, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { QuestionComment } from "./question-comment";
import { QuestionContextMenu } from "./question-context-menu";
import { ReplyContextMenu } from "./reply-context-menu";

interface Props {
  questionId: number;
  close: () => void;
  profile: ReturnType<typeof useUserProfile>;
}

export default function QuestionModal({ questionId, close, profile }: Props) {
  const { data: question, refetch } = useGetQuestion(Number(questionId), {
    cacheTime: 0,
    staleTime: 0
  });
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [reply, setReply] = useState("");
  const putQuestion = usePutQuestion();
  const { data: questionerStats } = useGetUserStats(question?.questioner?.id);
  const router = useBetterRouter();

  const replyQuestion = async () => {
    if (!question) return;
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    setReply("");
    setIsEditingReply(false);
    refetch();
  };

  const repliedOn = useMemo(() => getDifference(question?.repliedOn || undefined), [question?.repliedOn]);

  const handleClose = () => {
    if (reply.length > 10) {
      OpenDialog({
        type: "discard",
        submit: () => close()
      });
    } else {
      close();
    }
  };

  const questionContent = useMarkdown(question?.questionContent);
  const replyContent = useMarkdown(question?.reply);

  if (!question) return <></>;

  return (
    <Modal open={true} onClose={handleClose}>
      <ModalDialog layout="center" sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex y grow>
          <Flex y p={2} gap1>
            <Flex x yc xsb>
              <UnifiedUserItem
                nonClickable
                sx={{ px: 0, py: 0 }}
                user={question.questioner}
                nameLevel="title-sm"
                holdersAndReplies={questionerStats}
              />
              {profile?.isOwnProfile && (!question.repliedOn || isEditingReply) ? (
                <Button loading={putQuestion.isLoading} disabled={reply.length < 10} onClick={replyQuestion}>
                  Reply
                </Button>
              ) : (
                <QuestionContextMenu question={question} refetch={() => refetch()} />
              )}
            </Flex>
            {questionContent}
            <Typography level="helper">{format(question.createdAt, "MMM dd, yyyy")}</Typography>
            <Flex x yc xsb>
              <Flex x yc gap3>
                <Reactions questionId={question.id} />
                {question.repliedOn && profile.hasKeys && <AddCommentButton questionId={question?.id} />}
              </Flex>
              <IconButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: `${question.questioner.displayName} asked a question to ${question.replier.displayName}`,
                      text: `Get ${question.replier.displayName}’s keys on builder.fi to unlock their answer to this question !`,
                      url: `${location.origin}/question/${question.id}`
                    });
                  } else {
                    navigator.clipboard.writeText(location.origin + `/question/${question.id}`);
                    toast.success("question url copied to clipboard");
                  }
                }}
              >
                <FileUploadOutlined fontSize="small" />
              </IconButton>
            </Flex>
          </Flex>
          <Divider />
          <Flex y gap1 p={2}>
            {profile?.isOwnProfile && (!question.repliedOn || isEditingReply) && (
              <FullTextArea
                placeholder={`Answer ${question.questioner.displayName} ...`}
                avatarUrl={question.replier.avatarUrl || undefined}
                onChange={e => setReply(e.target.value)}
                value={reply}
              />
            )}
            {question.repliedOn && profile?.hasKeys && !isEditingReply && (
              <Flex x ys gap={1} grow fullwidth>
                <Avatar
                  size="sm"
                  src={question.replier.avatarUrl || DEFAULT_PROFILE_PICTURE}
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/profile/${question.replier?.wallet}`)}
                />
                <Flex y gap={0.5} fullwidth>
                  <Flex x yc xsb fullwidth>
                    <Flex x yc gap={0.5}>
                      <Typography
                        level="title-sm"
                        sx={{ cursor: "pointer" }}
                        onClick={() => router.push(`/profile/${question.replier?.wallet}`)}
                      >
                        {question.replier.displayName}{" "}
                      </Typography>
                      <Typography level="body-sm">•</Typography>
                      <Typography level="body-sm">{repliedOn}</Typography>
                    </Flex>
                    <Flex>
                      <ReplyContextMenu
                        question={question}
                        refetchQuestion={() => refetch()}
                        onEdit={() => {
                          setReply(question.reply || "");
                          setIsEditingReply(true);
                        }}
                      />
                    </Flex>
                  </Flex>
                  {replyContent}
                </Flex>
              </Flex>
            )}
            {!profile?.hasKeys && question.repliedOn && (
              <PageMessage
                title="Unlock answer"
                icon={<LockOutlined />}
                text={`Hold at least one key to ask ${profile?.user?.displayName} a question and access all answers.`}
              />
            )}

            {!question.repliedOn && !profile?.isOwnProfile && (
              <PageMessage
                title="Waiting for answer ..."
                icon={<Avatar size="sm" src={profile?.user?.avatarUrl || undefined} />}
                text={
                  profile?.hasKeys
                    ? `You will get notified when ${profile?.user?.displayName} answers`
                    : `Buy a key, and get notified when ${profile?.user?.displayName} answers`
                }
              />
            )}
            {question.repliedOn && profile?.hasKeys && !isEditingReply && (
              <Reactions questionId={question.id} type="like" />
            )}
          </Flex>
          {question.repliedOn && (
            <Flex y sx={{ borderTop: "1px solid #E5E5E5" }}>
              <QuestionComment questionId={question.id} />
            </Flex>
          )}
        </Flex>
      </ModalDialog>
    </Modal>
  );
}
