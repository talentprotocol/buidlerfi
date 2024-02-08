import QuestionPage from "@/components/app/question/question-page";
import { BASE_URL } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const question = await prisma.question.findUnique({
    where: { id: parseInt(id) },
    include: { questioner: true, replier: true }
  });

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${BASE_URL}/api/frame/action?id=${id}`,
    "fc:frame:image": `${BASE_URL}/api/frame/image?id=${id}`,
    "fc:frame:button:1": "upvote ⬆️",
    "fc:frame:button:2": "see more on builder.fi 👀",
    "fc:frame:button:2:action": `post_redirect`
  };

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
