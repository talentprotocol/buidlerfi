import { publishNewAnswerCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const question = await prisma.question.findUnique({ where: { id: Number(params.id) } });
    if (!question) return Response.json({ error: ERRORS.QUESTION_NOT_FOUND }, { status: 404 });

    const replier = await prisma.user.findUnique({ where: { privyUserId: req.headers.get("privyUserId")! } });

    if (question.replierId !== replier?.id) return Response.json({ error: ERRORS.UNAUTHORIZED }, { status: 401 });

    const res = await prisma.question.update({
      where: { id: Number(params.id) },
      data: {
        reply: body["answerContent"],
        repliedOn: new Date()
      }
    });

    // if in production, push the question to farcaster
    if (process.env.NODE_ENV === "production") {
      let questioner = await prisma.socialProfile.findUniqueOrThrow({
        where: {
          userId_type: {
            userId: question.questionerId,
            type: SocialProfileType.FARCASTER
          }
        }
      });
      if (!questioner) {
        questioner = await prisma.user.findUniqueOrThrow({ where: { id: question.questionerId } });
      }
      const replierFarcaster = await prisma.socialProfile.findUniqueOrThrow({
        where: {
          userId_type: {
            userId: question.replierId,
            type: SocialProfileType.FARCASTER
          }
        }
      });
      if (questioner || replierFarcaster) {
        // if one of the two has farcaster, publish the cast
        await publishNewAnswerCast(
          replierFarcaster?.profileName || replier.name,
          questioner?.profileName || questioner.name,
          `https://builder.fi/profile/${replier.wallet}?question=${question.id}`
        );
      }
    }

    return Response.json({ data: res }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
