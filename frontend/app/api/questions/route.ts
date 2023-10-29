import { fetchHolders } from "@/lib/api/common/builderfi";
import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { replierWallet, questionContent } = await req.json();
    if (!replierWallet || !questionContent) {
      return Response.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }

    //TODO check if user isActive = true. Removed for now
    const questioner = await prisma.user.findUnique({ where: { privyUserId: req.headers.get("privyUserId")! } });
    const replier = await prisma.user.findUnique({ where: { wallet: replierWallet.toLowerCase() } });
    if (!questioner || !replier) {
      return Response.json({ error: ERRORS.USER_NOT_FOUND }, { status: 404 });
    }

    const replierHolders = await fetchHolders(replierWallet);
    const found = replierHolders.find(holder => holder.holder.owner.toLowerCase() === questioner.wallet.toLowerCase());
    if (!found || Number(found.heldKeyNumber) === 0) {
      return Response.json({ error: ERRORS.MUST_HOLD_KEY }, { status: 404 });
    }

    const question = await prisma.question.create({
      data: { questionerId: questioner.id, replierId: replier.id, questionContent: questionContent }
    });

    return Response.json({ data: question }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error from URL:", req.url);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const replierWallet = req.nextUrl.searchParams.get("replierWallet") as string;

    if (!replierWallet) {
      return Response.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }

    //TODO check if user isActive = true. Removed for now
    const replier = await prisma.user.findUnique({ where: { wallet: replierWallet.toLowerCase() } });
    if (!replier) {
      return Response.json({ error: ERRORS.USER_NOT_FOUND }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: { replierId: replier.id },
      include: { questioner: true, reactions: true, comments: true },
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ data: questions }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error from URL:", req.url);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
