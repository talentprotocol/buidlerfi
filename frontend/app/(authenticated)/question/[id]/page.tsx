import QuestionPage from "@/components/app/question/question-page";
import { BASE_URL } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { FrameButton, FrameButtonsType, getFrameFlattened } from "frames.js";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const question = await prisma.question.findUnique({ where: { id: parseInt(id) }, include: { questioner: true, replier: true } });
  const buttons: FrameButtonsType = [
    {
      label: "upvote ⬆️",
      action: "post"
    } as FrameButton
  ];
  // if replier id is null, question is open, so everyone can reply
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

  const title = (() => {
    if (!question) return "This question doesn't exist or was deleted";
    const questioner = question.questioner.displayName || shortAddress(question.questioner.wallet);
    if (question.replier) {
      if (question.replierId === question.questionerId) return `${questioner} asked himself a question`;
      else
        return `${questioner} asked ${
          question.replier.displayName || shortAddress(question.replier.wallet)
        } a question`;
    } else {
      return `${questioner} asked an open question`;
    }
  })();

  const description = question ? question.questionContent : undefined;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      //By passing undefined, we send the default image
      images: question ? [`${BASE_URL}/api/frame/image?id=${id}`] : undefined,
      description: description
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
