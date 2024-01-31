"use client";

import { CommentsList } from "@/components/app/[wallet]/comments-list";
import { QuestionContent } from "@/components/app/question/question-content";
import { QuestionReply } from "@/components/app/question/question-reply";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useGetQuestion, usePutQuestion } from "@/hooks/useQuestionsApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BASE_URL } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { Button, Divider } from "@mui/joy";
import { Metadata } from "next";
import { useParams } from "next/navigation";
import { useState } from "react";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const question = await prisma.question.findUnique({ where: { id: parseInt(id) } });

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${BASE_URL}/api/upvote?id=${id}`,
    "fc:frame:image": `${BASE_URL}/api/image?id=${id}`,
    "fc:frame:button:1": "upvote ⬆️"
  };

  return {
    title: `${question?.questionContent.substring(0, 50)}`,
    openGraph: {
      title: `${question?.questionContent.substring(0, 50)}`,
      images: [`${BASE_URL}/api/image?id=${id}`]
    },
    other: {
      ...fcMetadata
    },
    metadataBase: new URL(BASE_URL || "")
  };
}

export default function QuestionPage() {
  const { id: questionId } = useParams();
  const { data: question, refetch } = useGetQuestion(Number(questionId), {
    cacheTime: 0,
    staleTime: 0
  });
  const profile = useUserProfile(question?.replier?.wallet as `0x${string}`);
  const putQuestion = usePutQuestion();
  const [reply, setReply] = useState("");

  const replyQuestion = async () => {
    if (!question) return;
    await putQuestion.mutateAsync({
      id: question.id,
      answerContent: reply
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
        {question.replierId && <QuestionReply {...{ question, profile, reply, setReply, refetch }} />}
        {(isOpenQuestion || (!isOpenQuestion && question.repliedOn)) && (
          <CommentsList isOpenQuestion={isOpenQuestion} questionId={question.id} refetch={() => refetch()} />
        )}
      </Flex>
    </Flex>
  );
}
