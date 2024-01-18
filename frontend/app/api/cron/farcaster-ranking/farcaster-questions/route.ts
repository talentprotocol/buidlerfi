import { ERRORS } from "@/lib/errors";
import { getTopUsersByQuestionsAskedInTimeInterval } from "@/backend/user/user";
import { publishTopFarcasterAnswersCast } from "@/lib/api/backend/farcaster";

export const GET = async () => {
    try {
        // Call the function and await the response
        const response = await getTopUsersByQuestionsAskedInTimeInterval(10, 4);

        // Extract the data from the response
        const topUsersArray = response.data.map((user: { wallet: string; }) => user.wallet);
        const answerSent = response.data.map(user => user.questionsAsked.toString()); // Convert questionsAsked array to strings
        
        // publish cast on Farcaster
        const cast = await publishTopFarcasterAnswersCast(
            topUsersArray, // Convert topUsers object to an array of strings
            answerSent,
        );
        console.log(cast);
        return Response.json({ message: "Done: Top 10 Farcaster users with the most questions" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};

