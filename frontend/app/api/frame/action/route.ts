import { getUser } from "@/backend/user/user";
import { BASE_URL } from "@/lib/constants";
import { commentQuestion, downvoteQuestion, getQuestionImageUrl, upvoteQuestion } from "@/lib/frame/questions";
import { getFarcasterIdentity } from "@/lib/frame/web3bio";
import { FrameActionPayload, getAddressForFid, getFrameHtml, getFrameMessage, validateFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  const isReply = searchParams.get("isReply") === "true" ?? false;

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
  const body: FrameActionPayload = await req.json();

  const frameMessage = await getFrameMessage(body);
  // Step 3. Validate the message
  const { isValid, message } = await validateFrameMessage(body);

  // Step 4. Determine the experience based on the validity of the message
  if (isValid) {
    // Step 5. Get from the message the Account Address of the user using the Frame
    const fid = message?.data.fid;
    accountAddress = (await getAddressForFid({ fid: fid as number })) as string;
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
  console.log("button index", frameMessage.buttonIndex);

  // check if user has keys for the answer
  if (isReply) {
    return new NextResponse(
      getFrameHtml({
        version: "vNext",
        image: getQuestionImageUrl(id, false, false, false, false, true, false),
        buttons: [
          { label: "buy user keys 🔑", action: "post_redirect" },
          { label: "i own user keys 👀", action: "post" }
        ],
        postUrl: `${BASE_URL}/api/frame/redirect?id=${id}`
      })
    );
  }

  // check if user is not on builder.fi
  const { error, data } = await getUser(accountAddress);
  console.log("user data :", data, error);
  if (!!error || !data) {
    return new NextResponse(
      getFrameHtml({
        version: "vNext",
        image: getQuestionImageUrl(id, false, false, false, true),
        buttons: [{ label: "sign up now! 🔷", action: "post_redirect" }],
        postUrl: `${BASE_URL}`
      })
    );
  }

  // index 3 means the user clicked the "reply" to the open question
  if (frameMessage.buttonIndex === 3) {
    try {
      let text: string | undefined = "";
      if (frameMessage.inputText) {
        text = frameMessage.inputText;
      }
      if (!text || text == "") {
        throw new Error("No text");
      }
      const farcasterIdentity = await getFarcasterIdentity(accountAddress);
      if (!farcasterIdentity) {
        throw new Error("No farcaster identity");
      }
      await commentQuestion(farcasterIdentity.identity, parseInt(id), text);
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl(id, false, true),
          buttons: [{ label: "read more on builder.fi 👀", action: "post_redirect" }],
          postUrl: `${BASE_URL}/api/frame/redirect?id=${id}`
        })
      );
    } catch (e) {
      console.error(e);
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl(id),
          buttons: [{ label: "try again", action: "post" }],
          postUrl: `${BASE_URL}/api/frame/action?id=${id}`
        })
      );
    }
  } else {
    try {
      const farcasterIdentity = await getFarcasterIdentity(accountAddress);
      if (!farcasterIdentity) {
        throw new Error("No farcaster identity");
      }

      let upvoted = false;
      let downvoted = false;
      if (frameMessage.buttonIndex === 2) {
        await upvoteQuestion(farcasterIdentity.identity, parseInt(id));
        upvoted = true;
      } else if (frameMessage.buttonIndex === 2) {
        await downvoteQuestion(farcasterIdentity.identity, parseInt(id));
        downvoted = true;
      }
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl(id, upvoted, downvoted),
          buttons: [{ label: "read more on builder.fi 👀", action: "post_redirect" }],
          postUrl: `${BASE_URL}/api/frame/redirect?id=${id}`
        })
      );
    } catch (e) {
      console.error(e);
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl(id),
          buttons: [{ label: "try again", action: "post" }],
          postUrl: `${BASE_URL}/api/frame/action?id=${id}`
        })
      );
    }
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
