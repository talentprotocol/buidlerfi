import { getTopicKeyRelationships } from "@/backend/keyRelationship/keyRelationship";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");
    const topicId = req.nextUrl.searchParams.get("topicId");
    if (!address) return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    const res = await getTopicKeyRelationships(address, topicId ? parseInt(topicId) : undefined);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
