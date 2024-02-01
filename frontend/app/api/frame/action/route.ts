import { BASE_URL } from "@/lib/constants";
import { getQuestionImageUrl, upvoteQuestion } from "@/lib/frame/questions";
import { getFarcasterIdentity } from "@/lib/frame/web3bio";
import { FrameRequest, getFrameAccountAddress, getFrameMessage } from "@coinbase/onchainkit";
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
  const { isValid, message } = await getFrameMessage(body);

  // Step 4. Determine the experience based on the validity of the message
  if (isValid) {
    // Step 5. Get from the message the Account Address of the user using the Frame
    accountAddress = (await getFrameAccountAddress(message, { NEYNAR_API_KEY: "NEYNAR_API_DOCS" })) as string;
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
  console.log("button index", message?.buttonIndex);
  if (message?.buttonIndex === 2) {
    // index 2 means the user clicked the "see more" button
    return new NextResponse(null, {
      status: 302,
      headers: { Location: `${BASE_URL}/question/${id}` }
    });
  }

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
