import { getQuestions } from "@/backend/question/question";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const offset = req.nextUrl.searchParams.has("offset") ? Number(req.nextUrl.searchParams.get("offset")) : 0;
    const user = req.nextUrl.searchParams.get("user");
    const side = req.nextUrl.searchParams.get("side");
    if (!user) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    const res = await getQuestions(
      { where: side === "questions" ? { questionerId: Number(user) } : { replierId: Number(user) } },
      offset
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
