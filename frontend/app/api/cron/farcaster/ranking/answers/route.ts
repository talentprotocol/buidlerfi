import { getTopUsersByAnswersGivenInTimeInterval } from "@/backend/user/user";
import { publishTopFarcasterAnswersCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";

export const GET = async () => {
  try {
    //const topUsers = getTopUsersByAnswersGivenInTimeInterval(10, 4);
    // Call the function and await the response
    const response = await getTopUsersByAnswersGivenInTimeInterval({startDate: new Date("2022"), limit: 10});

    // Extract the data from the response
    const data = response.data.map(d => ({
      username: d.socialProfiles[0].profileName,
      numAnswers: d.questionsAnswered
    }));
    // publish cast on Farcaster
    const cast = await publishTopFarcasterAnswersCast(data);
    console.log(cast);
    return Response.json({ message: "Done: Top 10 Farcaster users with the most answers" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
