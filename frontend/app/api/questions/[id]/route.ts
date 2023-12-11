import { publishNewAnswerCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { shortAddress } from "@/lib/utils";
import { SocialProfileType } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const question = await prisma.question.findUnique({ where: { id: Number(params.id) } });
    if (!question) return Response.json({ error: ERRORS.QUESTION_NOT_FOUND }, { status: 404 });

    const replier = await prisma.user.findUniqueOrThrow({
      where: { privyUserId: req.headers.get("privyUserId")! },
      include: { socialProfiles: true }
    });

    if (question.replierId !== replier?.id) return Response.json({ error: ERRORS.UNAUTHORIZED }, { status: 401 });

    const res = await prisma.$transaction(async tx => {
      const question = await tx.question.update({
        where: { id: Number(params.id) },
        data: {
          reply: body["answerContent"],
          repliedOn: new Date()
        }
      });
      tx.notification.create({
        data: {
          targetUserId: question.questionerId,
          sourceUserId: replier.id,
          type: "REPLIED_YOUR_QUESTION",
          referenceId: question.id
        }
      });
      return question;
    });

    console.log("Farcaster enabled -> ", process.env.ENABLE_FARCASTER);
    if (process.env.ENABLE_FARCASTER === "true") {
      const questioner = await prisma.user.findUnique({
        where: { id: question.questionerId },
        include: { socialProfiles: true }
      });
      const questionerFarcaster = questioner?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);
      const replierFarcaster = replier?.socialProfiles.find(sp => sp.type === SocialProfileType.FARCASTER);

      console.log("FOUND questioner -> ", !!questionerFarcaster);
      console.log("FOUND replier -> ", !!replierFarcaster);

      if (questionerFarcaster || replierFarcaster) {
        const replierName = replierFarcaster?.profileName
          ? `@${replierFarcaster?.profileName}`
          : replier.displayName || shortAddress(replier.wallet || "");
        const questionerName = questionerFarcaster?.profileName
          ? `@${questionerFarcaster?.profileName}`
          : questioner?.displayName || shortAddress(questioner?.wallet || "");
        // if one of the two has farcaster, publish the cast
        console.log("CASTING NEW ANSWER");
        await publishNewAnswerCast(
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
