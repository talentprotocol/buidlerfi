"use client";

import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { PageMessage } from "@/components/shared/page-message";
import { Reactions } from "@/components/shared/reactions";
import { UserItemFromAddress } from "@/components/shared/user-item";
import { OpenDialog } from "@/contexts/DialogContainer";
import { useProfileContext } from "@/contexts/profileContext";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { useDateDifferenceFromNow } from "@/hooks/useDateDifference";
import { useGetQuestion, usePutQuestion } from "@/hooks/useQuestionsApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { FileUpload, LockOutlined } from "@mui/icons-material";
import { Avatar, Button, Divider, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function QuestionModal({ questionId, close }: { questionId: number; close: () => void }) {
  const { data: question, refetch } = useGetQuestion(Number(questionId));
  const { hasKeys, socialData, isOwnProfile, holders } = useProfileContext();
  const [reply, setReply] = useState("");
  const putQuestion = usePutQuestion();
  const { buyPrice } = useGetBuilderInfo(socialData.wallet);
  const pathname = usePathname();

  const replyQuestion = async () => {
    if (!question) return;
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
    });
    refetch();
  };

  const repliedOn = useDateDifferenceFromNow(question?.repliedOn || undefined);

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

  if (!question) return <></>;

  return (
    <Modal open={true} onClose={handleClose}>
      <ModalDialog layout="center" sx={{ width: "min(100vw, 500px)", padding: 0 }}>
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
            {isOwnProfile && !question.reply && <Button onClick={replyQuestion}>Reply</Button>}
          </Flex>
          <Typography
            fontWeight={300}
            level="body-sm"
            whiteSpace="pre-line"
            textColor={"neutral.800"}
            textTransform={"none"}
          >
            {question.questionContent}
          </Typography>
          <Flex x yc xsb>
            <Reactions question={question} refetch={refetch} />
            <IconButton
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(location.origin + pathname + `?question=${question.id}`);
                toast.success("Copied share link to clipboard");
              }}
            >
              <FileUpload fontSize="small" />
            </IconButton>
          </Flex>
          <Divider sx={{ mx: -2 }} />
          {isOwnProfile && !question.reply && (
            <FullTextArea
              placeholder={`Answer ${question.questioner.displayName} ...`}
              avatarUrl={question.questioner.avatarUrl || undefined}
              onChange={e => setReply(e.target.value)}
              value={reply}
            />
          )}
          {question.reply && hasKeys && (
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
                  {question.reply}
                </Typography>
              </Flex>
            </Flex>
          )}
          {!hasKeys && question.reply && (
            <PageMessage
              title="Unlock answer"
              icon={<LockOutlined />}
              text={`Hold at least one key to ask ${socialData.displayName} a question and access all answers.`}
            />
          )}

          {!question.reply && !isOwnProfile && (
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
          {question.reply && hasKeys && <Reactions question={question} type="like" refetch={refetch} />}
        </Flex>
      </ModalDialog>
    </Modal>
  );
}
