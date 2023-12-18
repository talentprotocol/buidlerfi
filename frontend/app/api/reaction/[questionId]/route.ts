import { getReactions } from "@/backend/question/question";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { questionId: number } }) {
  return NextResponse.json(await getReactions(Number(params.questionId), "upvote"));
}
