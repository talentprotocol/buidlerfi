import QuestionPage from "@/components/app/question/question-page";
import { BASE_URL } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const question = await prisma.question.findUnique({ where: { id: parseInt(id) } });

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${BASE_URL}/api/frame/action?id=${id}`,
    "fc:frame:image": `${BASE_URL}/api/frame/image?id=${id}`,
    "fc:frame:button:1": "upvote ⬆️",
    "fc:frame:button:2": "see more on builder.fi 👀",
    "fc:frame:button:2:action": `post_redirect`
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

export default function Question() {
  return <QuestionPage />;
}
