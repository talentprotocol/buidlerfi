import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const question = await prisma.question.findUnique({ where: { id: params.id } });
    if (!question) return Response.json({ error: ERRORS.QUESTION_NOT_FOUND }, { status: 404 });
    //TODO Check if question replier is current user

    const res = await prisma.question.update({ where: { id: params.id }, data: body });

    return Response.json({ data: res }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
