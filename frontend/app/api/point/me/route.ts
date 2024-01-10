import { getPointsHistory } from "@/backend/point/point";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const privyUserId = req.headers.get("privyUserId");
    if (!privyUserId) {
      return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }
    return NextResponse.json(await getPointsHistory(privyUserId));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
