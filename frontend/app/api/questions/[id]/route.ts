import { publishNewAnswerCast } from "@/lib/api/backend/farcaster";
import { publishNewAnswerLensPost } from "@/lib/api/backend/lens";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { SocialProfileType } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const question = await prisma.question.findUnique({ where: { id: Number(params.id) } });
    if (!question) return Response.json({ error: ERRORS.QUESTION_NOT_FOUND }, { status: 404 });

    const replier = await prisma.user.findUnique({
      where: { privyUserId: req.headers.get("privyUserId")! },
      include: { socialProfiles: true }
    });

    if (question.replierId !== replier?.id) return Response.json({ error: ERRORS.UNAUTHORIZED }, { status: 401 });

    const res = await prisma.question.update({
      where: { id: Number(params.id) },
      data: {
        reply: body["answerContent"],
        repliedOn: new Date()
      }
    });

    console.log("Farcaster enabled -> ", process.env.ENABLE_FARCASTER);
    if (process.env.ENABLE_FARCASTER === "true") {
      const questioner = await prisma.user.findUnique({
        where: { id: question.questionerId },
        include: { socialProfiles: true }
      });
      const questionerFarcaster = questioner?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
      const replierFarcaster = replier?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);

      const questionerLens = questioner?.socialProfiles.find(sp => sp.type === SocialProfileType.LENS);
      const replierLens = replier?.socialProfiles.find(sp => sp.type === SocialProfileType.LENS);

      console.log("FOUND questioner -> ", !!questionerFarcaster);
      console.log("FOUND replier -> ", !!replierFarcaster);

      if (questionerFarcaster || replierFarcaster) {
        // if one of the two has farcaster, publish the cast
        const replierName = replierFarcaster?.profileName
          ? `@${replierFarcaster?.profileName}`
          : replier.displayName || shortAddress(replier.wallet || "");
        const questionerName = questionerFarcaster?.profileName
          ? `@${questionerFarcaster?.profileName}`
          : questioner?.displayName || shortAddress(questioner?.wallet || "");
        console.log("CASTING NEW ANSWER");
        await publishNewAnswerCast(
          replierName,
          questionerName,
          `https://app.builder.fi/profile/${replier.wallet}?question=${question.id}`
        );
      }

      if (questionerLens || replierLens) {
        // if one of the two has lens, publish the cast
        const replierName = replierLens?.profileName
          ? `@lens/${replierLens?.profileName}`
          : replier.displayName || shortAddress(replier.wallet || "");
        const questionerName = questionerLens?.profileName
          ? `@lens/${questionerLens?.profileName}`
          : questioner?.displayName || shortAddress(questioner?.wallet || "");
        console.log("CASTING NEW ANSWER");
        await publishNewAnswerLensPost(
          replierName,
          questionerName,
          `https://app.builder.fi/profile/${replier.wallet}?question=${question.id}`
        );
      }
    }

    return Response.json({ data: res }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
