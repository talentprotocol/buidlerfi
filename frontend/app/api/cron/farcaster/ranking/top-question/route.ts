import { getMostUpvotedQuestion, getQuestion } from "@/backend/question/question";
import { getFarcasterProfileName, publishQuestionsOfTheWeekCast } from "@/lib/api/backend/farcaster";
import { ERRORS } from "@/lib/errors";
import { Question, SocialProfile, SocialProfileType, User } from "@prisma/client";

export const revalidate = 0;
export const GET = async () => {
  console.log("Running cron job: Top upvoted question of the week");
  try {
    // Call the function and await the response
    console.log("Fetching top upvoted question of the week");
    const questionId = await getMostUpvotedQuestion();

    // Extract the data from the response
    const { data: questionDetail } = await getQuestion(questionId!, undefined, true);

    const question = questionDetail as unknown as Question & {
      questioner: { socialProfiles: SocialProfile[] };
      replier: { socialProfiles: SocialProfile[]; wallet: string };
    };

    console.log("Getting questioner and replier names");
    const questionerName = getFarcasterProfileName(
      question.questioner as unknown as User,
      question.questioner.socialProfiles.find(p => p.type === SocialProfileType.FARCASTER)
    );

    const replierName = getFarcasterProfileName(
      question.replier as unknown as User,
      question.replier.socialProfiles.find(p => p.type === SocialProfileType.FARCASTER)
    );

    console.log("Publishing cast");
    // publish cast on Farcaster
    await publishQuestionsOfTheWeekCast(
      question.questionContent, // Extract the 'data' property from questionContent
      questionerName, // Pass the 'wallet' property of questioner as the argument
      replierName,
      `https://app.builder.fi/question/${questionId}`
    );
    return Response.json({ message: "Done: Top upvoted question of the week" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
  }
};
