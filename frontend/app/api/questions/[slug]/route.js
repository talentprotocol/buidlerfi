export async function GET(req, { params }) {
  try {
    console.log(params);
    // const question = await UpdateQuestion.call(Number(params.id), body.answerContent);

    return Response.json({ data: params }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
