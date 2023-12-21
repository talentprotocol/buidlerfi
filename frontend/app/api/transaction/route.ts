import { getTransactions } from "@/backend/transaction/transaction";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const privyUserId = req.headers.get("privyUserId");
    const offset = req.nextUrl.searchParams.has("offset") ? Number(req.nextUrl.searchParams.get("offset")) : 0;
    const side = req.nextUrl.searchParams.get("side") as "holder" | "owner" | "both" | "all";
    if (!privyUserId || !side) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    return NextResponse.json(await getTransactions(privyUserId, side, offset));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
