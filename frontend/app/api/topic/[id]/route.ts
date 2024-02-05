import { getTopic } from "@/backend/topic/topic";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const privyUserId = req.headers.get("privyUserId");
    if (!privyUserId) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    const res = await getTopic(privyUserId, params.id);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
