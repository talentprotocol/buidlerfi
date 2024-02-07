import { BASE_URL } from "@/lib/constants";
import { commentQuestion, getQuestionImageUrl, upvoteQuestion } from "@/lib/frame/questions";
import { getFarcasterIdentity } from "@/lib/frame/web3bio";
import { FrameRequest, getFrameMessage } from "@coinbase/onchainkit";
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

  let accountAddress = "";
  // Step 2. Read the body from the Next Request
  const body: FrameRequest = await req.json();
  // Step 3. Validate the message
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: "NEYNAR_ONCHAIN_KIT" });

  // Step 4. Determine the experience based on the validity of the message
  if (isValid) {
    // Step 5. Get from the message the Account Address of the user using the Frame
    accountAddress = message.interactor.verified_accounts[0];
  } else {
    // sorry, the message is not valid and it will be undefined
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
  console.log("Frame is valid");
  console.log("button index", message?.button);

  // index 2 means the user clicked the "reply" to the open question
  if (message?.button === 2) {
    try {
      let text: string | undefined = "";
      if (message?.input) {
        text = message.input;
      }
      if (!text || text == "") {
        throw new Error("No text");
      }
      const farcasterIdentity = await getFarcasterIdentity(accountAddress);
      if (!farcasterIdentity) {
        throw new Error("No farcaster identity");
      }
      await commentQuestion(farcasterIdentity.identity, parseInt(id), text);
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
  // index 1 means the user clicked the "upvote" to the open question
  try {
    const farcasterIdentity = await getFarcasterIdentity(accountAddress);
    if (!farcasterIdentity) {
      throw new Error("No farcaster identity");
    }
    await upvoteQuestion(farcasterIdentity.identity, parseInt(id));
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
