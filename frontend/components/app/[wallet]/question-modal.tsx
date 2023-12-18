"use client";

import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { Reactions } from "@/components/shared/reactions";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useProfileContext } from "@/contexts/profileContext";
import { useGetQuestion, usePutQuestion } from "@/hooks/useQuestionsApi";
import { useGetUserStats } from "@/hooks/useUserApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { getDifference } from "@/lib/utils";
import { FileUploadOutlined, LockOutlined } from "@mui/icons-material";
import { Avatar, Button, Divider, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import anchorme from "anchorme";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import sanitize from "sanitize-html";
import { QuestionContextMenu } from "./question-context-menu";
import { ReplyContextMenu } from "./reply-context-menu";

export default function QuestionModal({ questionId, close }: { questionId: number; close: () => void }) {
  const { data: question, refetch } = useGetQuestion(Number(questionId));
  const [isEditingReply, setIsEditingReply] = useState(false);
  const { hasKeys, socialData, isOwnProfile } = useProfileContext();
  const [reply, setReply] = useState("");
  const putQuestion = usePutQuestion();
  const pathname = usePathname();
  const { data: questionerStats } = useGetUserStats(question?.questioner?.id);

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

  const sanitizedContent = useMemo(
    () =>
      question?.questionContent
        ? sanitize(
            anchorme({ input: question?.questionContent, options: { attributes: { target: "_blank" }, truncate: 20 } })
          )
        : "",
    [question?.questionContent]
  );

  const sanitizedReply = useMemo(
    () =>
      question?.reply
        ? sanitize(
            anchorme({ input: question?.reply || "", options: { attributes: { target: "_blank" }, truncate: 20 } })
          )
        : "",
    [question?.reply]
  );

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
              {isOwnProfile && (!question.repliedOn || isEditingReply) ? (
                <Button loading={putQuestion.isLoading} disabled={reply.length < 10} onClick={replyQuestion}>
                  Reply
                </Button>
              ) : (
                <QuestionContextMenu question={question} refetch={() => refetch()} />
              )}
            </Flex>
            <Typography fontWeight={300} level="body-sm" whiteSpace="pre-line" textColor={"neutral.800"}>
              <div className="remove-text-transform" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </Typography>
            <Typography level="helper">{format(question.createdAt, "MMM dd, yyyy")}</Typography>
            <Flex x yc xsb>
              <Reactions questionId={question.id} />
              <IconButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(location.origin + pathname + `?question=${question.id}`);
                  toast.success("question url copied to clipboard");
                }}
              >
                <FileUploadOutlined fontSize="small" />
              </IconButton>
            </Flex>
          </Flex>
          <Divider />
          <Flex y gap1 p={2}>
            {isOwnProfile && (!question.repliedOn || isEditingReply) && (
              <FullTextArea
                placeholder={`Answer ${question.questioner.displayName} ...`}
                avatarUrl={question.replier.avatarUrl || undefined}
                onChange={e => setReply(e.target.value)}
                value={reply}
              />
            )}
            {question.repliedOn && hasKeys && !isEditingReply && (
              <Flex x ys gap={1} grow fullwidth>
                <Avatar size="sm" src={question.replier.avatarUrl || DEFAULT_PROFILE_PICTURE} />
                <Flex y gap={0.5} fullwidth>
                  <Flex x yc xsb fullwidth>
                    <Flex x yc gap={0.5}>
                      <Typography level="title-sm">{question.replier.displayName} </Typography>
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
                  <Typography fontWeight={300} level="body-sm" whiteSpace="pre-line" textColor={"neutral.800"}>
                    <div className="remove-text-transform" dangerouslySetInnerHTML={{ __html: sanitizedReply }} />
                  </Typography>
                </Flex>
              </Flex>
            )}
            {!hasKeys && question.repliedOn && (
              <PageMessage
                title="Unlock answer"
                icon={<LockOutlined />}
                text={`Hold at least one key to ask ${socialData?.displayName} a question and access all answers.`}
              />
            )}

            {!question.repliedOn && !isOwnProfile && (
              <PageMessage
                title="Waiting for answer ..."
                icon={<Avatar size="sm" src={socialData?.avatarUrl} />}
                text={
                  hasKeys
                    ? `You will get notified when ${socialData?.displayName} answers`
                    : `Buy a key, and get notified when ${socialData?.displayName} answers`
                }
              />
            )}
            {question.repliedOn && hasKeys && !isEditingReply && <Reactions questionId={question.id} type="like" />}
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
}
