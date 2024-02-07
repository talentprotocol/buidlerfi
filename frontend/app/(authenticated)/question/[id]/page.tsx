import QuestionPage from "@/components/app/question/question-page";
import { BASE_URL } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { FrameButton, FrameButtonsType, getFrameFlattened } from "frames.js";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const question = await prisma.question.findUnique({ where: { id: parseInt(id) } });
  const buttons: FrameButtonsType = [
    {
      label: "upvote ⬆️",
      action: "post"
    } as FrameButton
  ];
  if (question?.replierId == null) {
    buttons.push({ label: "reply ✍️", action: "post" });
  }
  const fcMetadata: Record<string, string> = getFrameFlattened({
    version: "vNext",
    buttons,
    image: `${BASE_URL}/api/frame/image?id=${id}`,
    inputText: question?.replierId == null ? "your answer here" : undefined,
    postUrl: `${BASE_URL}/api/frame/action?id=${id}`
  });

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

export default function Question() {
  return <QuestionPage />;
}
