import { getMostUpvotedQuestion, getQuestion } from "@/backend/question/question";
import { publishQuestionsOfTheWeekCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const GET = async () => {
  try {
    // Call the function and await the response
    const questionId = await getMostUpvotedQuestion();

    const questionDetail = await getQuestion(questionId!);

    // publish cast on Farcaster
    const cast = await publishQuestionsOfTheWeekCast(
      questionDetail.data.questionContent, // Extract the 'data' property from questionContent
      questionDetail.data.questioner.wallet, // Pass the 'wallet' property of questioner as the argument
      questionDetail.data.replier.wallet,
      `https://app.builder.fi/profile/${questionDetail.data.replier.wallet}?question=${questionId}`
    );
    console.log(cast);
    return Response.json({ message: "Done: Top upvoted question of the week" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
