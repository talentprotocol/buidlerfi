import { getComments } from "@/backend/comment/comment";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const questionId = req.nextUrl.searchParams.has("questionId")
    ? Number(req.nextUrl.searchParams.get("questionId"))
    : undefined;
  const privyUserId = req.headers.get("privyUserId");
  if (!privyUserId || !questionId) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });

  try {
    return NextResponse.json(await getComments(privyUserId, questionId));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
