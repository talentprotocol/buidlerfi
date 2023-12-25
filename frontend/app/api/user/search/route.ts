import { search } from "@/backend/user/user";
import { ERRORS } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const offset = req.nextUrl.searchParams.has("offset") ? Number(req.nextUrl.searchParams.get("offset")) : 0;
    const privyUserId = req.headers.get("privyUserId");
    const includeOwnedKeysOnly = req.nextUrl.searchParams.has("includeOwnedKeysOnly")
      ? req.nextUrl.searchParams.get("includeOwnedKeysOnly") === "true"
      : false;
    const searchValue = req.nextUrl.searchParams.get("search");
    if (!searchValue || !privyUserId) {
      return NextResponse.json({ error: ERRORS.INVALID_REQUEST }, { status: 400 });
    }
    return NextResponse.json(await search(privyUserId, searchValue, includeOwnedKeysOnly, offset));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
}
