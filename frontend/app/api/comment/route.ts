import { getComments } from "@/backend/comment/comment";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;
export async function GET(req: NextRequest) {
  try {
    const questionId = req.nextUrl.searchParams.has("questionId")
      ? Number(req.nextUrl.searchParams.get("questionId"))
      : undefined;
    const privyUserId = req.headers.get("privyUserId");
    if (!questionId) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    const res = await getComments(questionId, privyUserId || undefined);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
