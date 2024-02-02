import { BASE_URL } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? undefined;
  return new NextResponse(null, {
    status: 302,
    headers: { Location: `${BASE_URL}/question/${id}` }
  });
}

export const dynamic = "force-dynamic";
