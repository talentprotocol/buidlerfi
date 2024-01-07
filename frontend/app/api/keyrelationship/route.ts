import { getKeyRelationships } from "@/backend/keyRelationship/keyRelationship";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const side = req.nextUrl.searchParams.has("side")
      ? (req.nextUrl.searchParams.get("side") as "holder" | "owner")
      : "holder";
    if (!address) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    const res = await getKeyRelationships(address, side);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
