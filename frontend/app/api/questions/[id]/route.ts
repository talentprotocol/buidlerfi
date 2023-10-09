console.log("Route PUT");

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(params.id);
    // const question = await UpdateQuestion.call(Number(params.id), body.answerContent);

    return Response.json({ data: params }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(params.id);
    // const question = await UpdateQuestion.call(Number(params.id), body.answerContent);

    return Response.json({ data: params }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
