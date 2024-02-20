import { BASE_URL } from "@/lib/constants";
import { commentQuestion, downvoteQuestion, getQuestionImageUrl, upvoteQuestion } from "@/lib/frame/questions";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";
import { FrameActionPayload, getFrameHtml, getFrameMessage, validateFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;

  if (!id) {
    return new NextResponse(
      null, {status: 404}
    );
  }

  // Step 2. Read the body from the Next Request
  const body: FrameActionPayload = await req.json();

  const frameMessage = await getFrameMessage(body);
  // Step 3. Validate the message
  const { isValid } = await validateFrameMessage(body, {
    hubRequestOptions: { headers: { api_key: process.env.NEYNAR_API_KEY! } }
  });

  // Step 4. Determine the experience based on the validity of the message
  if (!isValid) {
    console.log("Invalid message");
    return new NextResponse(null, { status: 400 });
  }

  // check if user is on builder.fi with his fc account
  const farcasterProfile = await prisma.socialProfile.findFirst({
    where: { profileName: frameMessage.requesterUserData?.username, type: SocialProfileType.FARCASTER },
    include: { user: true }
  });
  if (!farcasterProfile) {
    console.log("User is not on builder.fi with his fc account");
    return new NextResponse(
      getFrameHtml({
        version: "vNext",
        image: getQuestionImageUrl({ questionId: id, userNotSignedUp: true }),
        buttons: [{ label: "sign up now! 🔷", action: "post_redirect" }],
        postUrl: `${BASE_URL}`
      })
    );
  }

  try {
    if (frameMessage.buttonIndex === 1) {
      await upvoteQuestion(farcasterProfile.profileName, parseInt(id));
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl({ questionId: id, privyUserId: farcasterProfile.userId, upvoted: true }),
          buttons: [{ label: "read more on builder.fi 👀", action: "post_redirect" }],
          postUrl: `${BASE_URL}/api/frame/redirect?id=${id}`
        })
      );
    } else if (frameMessage.buttonIndex === 2) {
      await downvoteQuestion(farcasterProfile.profileName, parseInt(id));
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl({ questionId: id, privyUserId: farcasterProfile.userId, downvoted: true }),
          buttons: [{ label: "read more on builder.fi 👀", action: "post_redirect" }],
          postUrl: `${BASE_URL}/api/frame/redirect?id=${id}`
        })
      );
    } else if (frameMessage.buttonIndex === 3) {
      let text: string | undefined = "";
      if (frameMessage.inputText) {
        text = frameMessage.inputText;
      }
      if (!text || text == "") {
        throw new Error("No text");
      }
      await commentQuestion(farcasterProfile.profileName, parseInt(id), text);
      return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: getQuestionImageUrl({ questionId: id, privyUserId: farcasterProfile.userId, replied: true }),
          buttons: [{ label: "read more on builder.fi 👀", action: "post_redirect" }],
          postUrl: `${BASE_URL}/api/frame/redirect?id=${id}`
        })
      );
    } else {
      throw new Error("Invalid button index");
    }
  } catch (e) {
    console.error(e);
    return new NextResponse(
      getFrameHtml({
        version: "vNext",
        image: getQuestionImageUrl({ questionId: id }),
        buttons: [{ label: "try again", action: "post" }],
        postUrl: `${BASE_URL}/api/frame/question?id=${id}`
      })
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
