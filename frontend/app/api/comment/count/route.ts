import { getCommentsCount } from "@/backend/comment/comment";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const questionId = Number(req.nextUrl.searchParams.get("questionId"));
    if (!questionId) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    return NextResponse.json(await getCommentsCount(questionId));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
