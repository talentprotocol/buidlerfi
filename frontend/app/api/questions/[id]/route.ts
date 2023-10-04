import UpdateQuestion from "@/backend/services/questions/update";

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const question = await UpdateQuestion.call(params.id, body.answerContent);

    return Response.json(question, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error url:", req.url);
    console.error("Error body:", await req.json());
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
