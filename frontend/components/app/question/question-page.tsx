"use client";

import { CommentsList } from "@/components/app/[wallet]/comments-list";
import { QuestionContent } from "@/components/app/question/question-content";
import { QuestionReply } from "@/components/app/question/question-reply";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useGetQuestion, usePutQuestion } from "@/hooks/useQuestionsApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function QuestionPage() {
  const { id: questionId } = useParams();
  const { data: question, refetch } = useGetQuestion(Number(questionId));
  const profile = useUserProfile(question?.replier?.wallet as `0x${string}`);
  const putQuestion = usePutQuestion();
  const [reply, setReply] = useState("");
  const [isGateAnswer, setIsGateAnswer] = useState(false);

  const replyQuestion = async () => {
    if (!question) return;
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply,
      isGated: isGateAnswer
    });
    setReply("");
    refetch();
  };

  const isOpenQuestion = !question?.replierId;
  if (!question) return <></>;
  return (
    <Flex y grow>
      <InjectTopBar
        title={profile.user?.displayName || shortAddress(profile.user?.wallet)}
        withBack
        endItem={
          profile.isOwnProfile && !question.repliedOn ? (
            <Button loading={putQuestion.isLoading} disabled={reply.length < 10} onClick={replyQuestion}>
              Answer
            </Button>
          ) : undefined
        }
      />
      <QuestionContent {...{ question, profile, refetch }} />
      <Divider />
      <Flex y grow>
        {question.replierId && (
          <QuestionReply {...{ question, profile, reply, setReply, refetch, isGateAnswer, setIsGateAnswer }} />
        )}
        {(isOpenQuestion || (!isOpenQuestion && question.repliedOn)) && (
          <CommentsList isOpenQuestion={isOpenQuestion} questionId={question.id} refetch={() => refetch()} />
        )}
      </Flex>
    </Flex>
  );
}
