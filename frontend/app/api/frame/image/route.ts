import { getQuestion } from "@/backend/question/question";
import { QuestionWithInfo, generateImageSvg } from "@/lib/frame/svg";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  const upvoted = searchParams.get("upvoted") === "true";
  const downvoted = searchParams.get("downvoted") === "true";
  const replied = searchParams.get("replied") === "true";
  const userNotSignedUp = searchParams.get("userNotSignedUp") === "true";
  const isReply = searchParams.get("isReply") === "true";
  const ownKeys = searchParams.get("ownKeys") === "true";
  const privyUserId = searchParams.get("privyUserId") ?? undefined;

  if (!id) {
    return new NextResponse(null, { status: 400 });
  }

  console.log("Fetching question...", id);

  const data = (await getQuestion(parseInt(id), privyUserId, true, true)) as unknown as {
    data: { question: QuestionWithInfo };
  };

  console.log("Question fetched!", id);

  const question = data.data;

  const svg = await generateImageSvg(
    question as unknown as QuestionWithInfo,
    upvoted,
    downvoted,
    replied,
    userNotSignedUp,
    isReply,
    ownKeys
  );

  console.log("SVG generated!");

  // Convert SVG to PNG using Sharp
  const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

  // Set the content type to PNG and send the response
  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "max-age=10"
    }
  });
};

export const dynamic = "force-dynamic";
