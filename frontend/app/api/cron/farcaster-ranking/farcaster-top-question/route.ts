import { ERRORS } from "@/lib/errors";
import { getMostUpvotedQuestionInTimeWindow, getQuestion, getQuestionContent } from "@/backend/question/question";
import { publishQuestionsOfTheWeekCast } from "@/lib/api/backend/farcaster";

export const GET = async () => {
    try {
        // Call the function and await the response
        const questionId = await getMostUpvotedQuestionInTimeWindow(7);

        const questionDetail = await getQuestion(questionId!); 
        const questionContent = await getQuestionContent(questionId!);
        
        // publish cast on Farcaster
        const cast = await publishQuestionsOfTheWeekCast(
            questionContent.data, // Extract the 'data' property from questionContent
            questionDetail.data.questioner.wallet, // Pass the 'wallet' property of questioner as the argument
            questionDetail.data.replier.wallet,
        );
        console.log(cast);
        return Response.json({ message: "Done: Top upvoted question of the week" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};