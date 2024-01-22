import { getTopUsersByQuestionsAskedInTimeInterval } from "@/backend/user/user";
import { publishTopFarcasterQuestionsCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const revalidate = 0;
export const GET = async () => {
  console.log("Running cron job: Top 10 Farcaster users by number of questions");
  try {
    // Call the function and await the response
    console.log("Fetching top 10 Farcaster users by number of questions");
    const response = await getTopUsersByQuestionsAskedInTimeInterval();

    // Extract the data from the response
    console.log("Parsing data");
    const data = response.data.map(d => ({
      username: d.socialProfiles[0].profileName,
      numQuestions: d.questionsAsked
    }));

    // publish cast on Farcaster
    console.log("Publishing cast");
    await publishTopFarcasterQuestionsCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster users with the most questions" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
