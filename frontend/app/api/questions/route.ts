import CreateQuestion from "@/backend/services/questions/create";
// import GetQuestions from "@/backend/services/questions/get";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let errorMessage = "";
    if (!body.questionerWallet) {
      errorMessage += "QuestionerWallet field is mandatory.";
    }
    if (!body.replierWallet) {
      errorMessage += " ReplierWallet field is mandatory.";
    }
    if (!body.questionContent) {
      errorMessage += " QuestionContent field is mandatory.";
    }

    if (errorMessage.length > 0) {
      return Response.json({ error: errorMessage }, { status: 409 });
    }

    const question = await CreateQuestion.call(body.questionerWallet, body.replierWallet, body.questionContent);

    return Response.json({ data: question }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error from URL:", req.url);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return Response.json({ data: "123" }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error from URL:", req.url);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}

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
