import { SearchQuestions } from "@/backend/question/question";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const offset = req.nextUrl.searchParams.has("offset") ? Number(req.nextUrl.searchParams.get("offset")) : 0;
    const privyUserId = req.headers.get("privyUserId");
    const searchValue = req.nextUrl.searchParams.get("search") ?? "";
    if (!searchValue || !privyUserId) {
      return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }
    const res = await SearchQuestions(searchValue, offset);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
