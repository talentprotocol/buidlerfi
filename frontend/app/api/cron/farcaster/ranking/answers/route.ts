import { getTopUsersByAnswersGivenInTimeInterval } from "@/backend/user/user";
import { publishTopFarcasterAnswersCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const revalidate = 0;
export const GET = async () => {
  try {
    // Call the function and await the response
    const response = await getTopUsersByAnswersGivenInTimeInterval();

    // Extract the data from the response
    const data = response.data.map(d => ({
      username: d.socialProfiles[0].profileName,
      numAnswers: d.questionsAnswered
    }));

    console.log(data);

    // publish cast on Farcaster
    await publishTopFarcasterAnswersCast(data);
    return Response.json({ message: "Done: Top 10 Farcaster users with the most answers" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
