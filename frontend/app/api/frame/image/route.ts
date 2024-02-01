import { getQuestion } from "@/backend/question/question";
import { BASE_URL, ERROR_IMAGE_URL } from "@/lib/constants";
import { QuestionWithInfo, generateImageSvg } from "@/lib/frame/svg";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  const upvoted = searchParams.get("upvoted") === "true";
  if (!id) {
    return new NextResponse(`<!DOCTYPE html><html><head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${ERROR_IMAGE_URL}" />
      <meta property="fc:frame:button:1" content="try again" />
      <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/upvote?id=${id}" />
      </head></html>`);
  }

  console.log("Fetching question...", id);

  const data = (await getQuestion(parseInt(id), undefined, true)) as unknown as {
    data: { question: QuestionWithInfo };
  };

  console.log("Question fetched!", id);

  const question = data.data;

  const svg = await generateImageSvg(question as unknown as QuestionWithInfo, upvoted);

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
