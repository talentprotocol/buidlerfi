import CreateQuestion from "@/backend/services/questions/create";
import GetQuestions from "@/backend/services/questions/get";

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
    const { searchParams } = new URL(req.url);
    const questionerWallet = searchParams.get("questionerWallet") as string;
    const replierWallet = searchParams.get("replierWallet") as string;

    let errorMessage = "";

    if (!questionerWallet) {
      errorMessage += "QuestionerWallet field is mandatory.";
    }
    if (!replierWallet) {
      errorMessage += " ReplierWallet field is mandatory.";
    }

    if (errorMessage.length > 0) {
      return Response.json({ error: errorMessage }, { status: 409 });
    }
    const questions = await GetQuestions.call(questionerWallet, replierWallet);

    return Response.json({ data: questions }, { status: 200 });
  } catch (error) {
    console.error(error);
    console.error("Error from URL:", req.url);
    return Response.json({ error: "Unexpected error. Contact Us." }, { status: 500 });
  }
}
