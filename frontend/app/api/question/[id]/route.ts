import { getQuestion } from "@/backend/question/question";
import { ERRORS } from "@/lib/errors";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: number } }) {
  try {
    const privyUserId = req.headers.get("privyUserId");
    const res = await getQuestion(Number(params.id), privyUserId || undefined);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
