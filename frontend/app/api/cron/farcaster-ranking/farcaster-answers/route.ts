import { ERRORS } from "@/lib/errors";
import { getTopUsersByAnswersGivenInTimeInterval } from "@/backend/user/user";
import { publishTopFarcasterAnswersCast } from "@/lib/api/backend/farcaster";

export const GET = async () => {
    try {
        //const topUsers = getTopUsersByAnswersGivenInTimeInterval(10, 4);
        // Call the function and await the response
        const response = await getTopUsersByAnswersGivenInTimeInterval(10, 4);

        // Extract the data from the response
        const topUsersArray = response.data.map(user => user.wallet);
        const questionsReceived = response.data.map(user => user.questionsReceived.toString()); // Convert questionsReceived array to strings
        
        // publish cast on Farcaster
        const cast = await publishTopFarcasterAnswersCast(
            topUsersArray, // Convert topUsers object to an array of strings
            questionsReceived,
        );
        console.log(cast);
        return Response.json({ message: "Done: Top 10 Farcaster users with the most answers" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};