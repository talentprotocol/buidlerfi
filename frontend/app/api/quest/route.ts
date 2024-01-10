import { getAllQuest } from "@/backend/quest/quest";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await getAllQuest());
}
