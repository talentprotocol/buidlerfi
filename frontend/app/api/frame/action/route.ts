import { BASE_URL } from "@/lib/constants";
import { getQuestionImageUrl, upvoteQuestion } from "@/lib/frame/questions";
import { getFrameAccountAddress } from "@coinbase/onchainkit";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  if (!id) {
    return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getQuestionImageUrl(0)}" />
    <meta property="fc:frame:button:1" content="try again" />
    <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/action?id=${id}" />
    </head></html>`);
  }
  let accountAddress: string | undefined;
  let messageBytes: string | undefined;
  try {
    const body = await req.json();
    messageBytes = body?.trustedData?.messageBytes;
    accountAddress = await getFrameAccountAddress(body, {
      NEYNAR_API_KEY: process.env.NEYNAR_API_KEY
    });
  } catch (err) {
    console.error(err);
    return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getQuestionImageUrl(id)}" />
    <meta property="fc:frame:button:1" content="try again" />
    <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/action?id=${id}" />
    </head></html>`);
  }
  console.log("Message is valid");

  if (!accountAddress) {
    return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getQuestionImageUrl(id)}" />
    <meta property="fc:frame:button:1" content="try again" />
    <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/action?id=${id}" />
    </head></html>`);
  }

  console.log("Account address is", accountAddress);

  const sdk = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
  const validatedFrame = await sdk.validateFrameAction(messageBytes!);
  if (!validatedFrame.valid) {
    console.log("Frame is invalid", validatedFrame);
    return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getQuestionImageUrl(id)}" />
    <meta property="fc:frame:button:1" content="try again" />
    <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/action?id=${id}" />
    </head></html>`);
  }

  if (validatedFrame.button?.index === 2) {
    // index 2 means the user clicked the "see more" button
    return new NextResponse(null, {
      status: 302,
      headers: { Location: `${BASE_URL}/question/${id}` }
    });
  }
  try {
    await upvoteQuestion(validatedFrame.action!.interactor.username!, parseInt(id));
  } catch (e) {
    console.error(e);
    return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getQuestionImageUrl(id)}" />
    <meta property="fc:frame:button:1" content="try again" />
    <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/action?id=${id}" />
    </head></html>`);
  }

  return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${getQuestionImageUrl(id, true)}" />
    <meta property="fc:frame:post_url" content="${BASE_URL}/api/frame/redirect?id=${id}" />
    <meta property="fc:frame:button:1" content="read more on builder.fi 👀" />
    <meta property="fc:frame:button:1:action" content="post_redirect" />
  </head></html>`);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
