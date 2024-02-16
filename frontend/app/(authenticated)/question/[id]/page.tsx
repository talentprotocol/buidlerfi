import QuestionPage from "@/components/app/question/question-page";
import { BASE_URL } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { FrameButton, FrameButtonsType, getFrameFlattened } from "frames.js";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const id = params.id;
  const isReply = searchParams.isReply === "true";
  const question = await prisma.question.findUnique({ where: { id: parseInt(id) } });

  let buttons: FrameButtonsType;
  if (isReply) {
    buttons = [
      { label: "buy user keys 🔑", action: "post_redirect" } as FrameButton,
      { label: "i own user keys 👀", action: "post" } as FrameButton
    ];
  } else {
    buttons = [
      { label: "upvote ⬆️", action: "post" } as FrameButton,
      { label: "downvote ⬇️", action: "post" } as FrameButton
    ];
    // if replier is not set, question is open, then user can reply
    if (question?.replierId == null) {
      buttons.push({ label: "reply ✍️", action: "post" } as FrameButton);
    }
  }

  const fcMetadata: Record<string, string> = getFrameFlattened({
    version: "vNext",
    buttons,
    image: `${BASE_URL}/api/frame/image?id=${id}${isReply ? "&isReply=true" : ""}`,
    inputText: question?.replierId == null ? "your answer here" : undefined,
    postUrl: `${BASE_URL}/api/frame/${isReply ? "reply" : "question"}?id=${id}`
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
