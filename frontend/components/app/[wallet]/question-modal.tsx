"use client";

import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { Reactions } from "@/components/shared/reactions";
import { UserItemFromAddress } from "@/components/shared/user-item";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useProfileContext } from "@/contexts/profileContext";
import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { useGetQuestion, usePutQuestion } from "@/hooks/useQuestionsApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { getDifference } from "@/lib/utils";
import { FileUploadOutlined, LockOutlined } from "@mui/icons-material";
import { Avatar, Button, Divider, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import anchorme from "anchorme";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import sanitize from "sanitize-html";

export default function QuestionModal({ questionId, close }: { questionId: number; close: () => void }) {
  const { data: question, refetch } = useGetQuestion(Number(questionId));
  const { hasKeys, socialData, isOwnProfile } = useProfileContext();
  const [reply, setReply] = useState("");
  const putQuestion = usePutQuestion();
  const { buyPrice } = useGetBuilderInfo(socialData.wallet);
  const { data: holders } = useGetHolders(question?.questioner.wallet as `0x${string}`);
  const pathname = usePathname();

  const replyQuestion = async () => {
    if (!question) return;
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    setReply("");
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
    () => (question?.questionContent ? sanitize(anchorme(question?.questionContent)) : ""),
    [question?.questionContent]
  );

  const sanitizedReply = useMemo(
    () => (question?.reply ? sanitize(anchorme(question?.reply || "")) : ""),
    [question?.reply]
  );

  if (!question) return <></>;

  return (
    <Modal open={true} onClose={handleClose}>
      <ModalDialog layout="center" sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex y gap2 p={2} grow>
          <Flex x yc xsb>
            <UserItemFromAddress
              isButton={false}
              px={0}
              py={0}
              address={question.questioner.wallet as `0x${string}`}
              buyPrice={buyPrice}
              numberOfHolders={holders?.length}
              nameLevel="title-sm"
            />
            {isOwnProfile && !question.repliedOn && (
              <Button loading={putQuestion.isLoading} disabled={reply.length < 10} onClick={replyQuestion}>
                Reply
              </Button>
            )}
          </Flex>
          <Typography
            fontWeight={300}
            level="body-sm"
            whiteSpace="pre-line"
            textColor={"neutral.800"}
            textTransform={"none"}
          >
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </Typography>
          <Flex x yc xsb>
            <Reactions question={question} refetch={refetch} />
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
          <Divider sx={{ mx: -2 }} />
          {isOwnProfile && !question.repliedOn && (
            <FullTextArea
              placeholder={`Answer ${question.questioner.displayName} ...`}
              avatarUrl={question.questioner.avatarUrl || undefined}
              onChange={e => setReply(e.target.value)}
              value={reply}
            />
          )}
          {question.repliedOn && hasKeys && (
            <Flex x ys gap={1} grow>
              <Avatar size="sm" src={question.replier.avatarUrl || DEFAULT_PROFILE_PICTURE} />
              <Flex y gap={0.5}>
                <Flex x yc gap={0.5}>
                  <Typography level="title-sm">{question.replier.displayName} </Typography>
                  <Typography level="body-sm">•</Typography>
                  <Typography level="body-sm">{repliedOn}</Typography>
                </Flex>
                <Typography
                  fontWeight={300}
                  level="body-sm"
                  whiteSpace="pre-line"
                  textColor={"neutral.800"}
                  textTransform={"none"}
                >
                  <div dangerouslySetInnerHTML={{ __html: sanitizedReply }} />
                </Typography>
              </Flex>
            </Flex>
          )}
          {!hasKeys && question.repliedOn && (
            <PageMessage
              title="Unlock answer"
              icon={<LockOutlined />}
              text={`Hold at least one key to ask ${socialData.displayName} a question and access all answers.`}
            />
          )}

          {!question.repliedOn && !isOwnProfile && (
            <PageMessage
              title="Waiting for answer ..."
              icon={<Avatar size="sm" src={socialData.avatarUrl} />}
              text={
                hasKeys
                  ? `You will get notified when ${socialData.displayName} answers`
                  : `Buy a key, and get notified when ${socialData.displayName} answers`
              }
            />
          )}
          {question.repliedOn && hasKeys && <Reactions question={question} type="like" refetch={refetch} />}
        </Flex>
      </ModalDialog>
    </Modal>
  );
}
