import { getQuestion } from "@/backend/question/question";
import { BASE_URL } from "@/lib/constants";
import { getQuestionImageUrl } from "@/lib/frame/questions";
import prisma from "@/lib/prisma";
import { SocialProfileType } from "@prisma/client";
import { FrameActionPayload, getFrameHtml, getFrameMessage, validateFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;

  if (!id) {
    return new NextResponse(null, { status: 404 });
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
    return new NextResponse(null, { status: 400 });
  }

  console.log("button index", frameMessage.buttonIndex);

  // check if user is on builder.fi with his fc account
  const farcasterProfile = await prisma.socialProfile.findFirst({
    where: { profileName: frameMessage.requesterUserData?.username, type: SocialProfileType.FARCASTER },
    include: { user: true }
  });
  if (!farcasterProfile) {
    return new NextResponse(
      getFrameHtml({
        version: "vNext",
        image: getQuestionImageUrl(id, false, false, false, true),
        buttons: [{ label: "sign up now! 🔷", action: "post_redirect" }],
        postUrl: `${BASE_URL}`
      })
    );
  }

  const question = await getQuestion(parseInt(id!), farcasterProfile.user.privyUserId!, true, true);
  if (!question) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: getQuestionImageUrl(id, false, false, false, true),
      buttons: [{ label: "sign up now! 🔷", action: "post_redirect" }],
      postUrl: `${BASE_URL}`
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = "force-dynamic";
