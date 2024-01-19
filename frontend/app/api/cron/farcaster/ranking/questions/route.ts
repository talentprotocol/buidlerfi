import { getTopUsersByQuestionsAskedInTimeInterval } from "@/backend/user/user";
import { publishTopFarcasterQuestionsCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const GET = async () => {
  try {
    // Call the function and await the response
    const response = await getTopUsersByQuestionsAskedInTimeInterval();

    // Extract the data from the response
    const data = response.data.map(d => ({
      username: d.socialProfiles[0].profileName,
      numQuestions: d.questionsAsked
    }));

    // publish cast on Farcaster
    await publishTopFarcasterQuestionsCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster users with the most questions" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
