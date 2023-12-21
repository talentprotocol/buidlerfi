import { getQuestions } from "@/backend/question/question";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const offset = req.nextUrl.searchParams.has("offset") ? Number(req.nextUrl.searchParams.get("offset")) : 0;
    const replier = req.nextUrl.searchParams.get("replier");
    if (!replier) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    return NextResponse.json(await getQuestions({ where: { replierId: Number(replier) } }, offset));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
