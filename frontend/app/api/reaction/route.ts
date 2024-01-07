import { getReactions } from "@/backend/question/question";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const questionId = req.nextUrl.searchParams.get("questionId");
    const type = req.nextUrl.searchParams.get("type");
    if (!questionId || !type || (type !== "like" && type !== "upvote"))
      return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    const res = await getReactions(Number(questionId), type);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
