import { replyToNewQuestionCast } from "@/lib/api/backend/farcaster";
import { BUILDERFI_FARCASTER_FID } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastWithInteractions as CastWithInteractionsV1 } from "@neynar/nodejs-sdk/build/neynar-api/v1";
import { CastWithInteractions as CastWithInteractionsV2 } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { SocialProfileType } from "@prisma/client";

export const GET = async () => {
  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);
  const { result } = await client.fetchMentionAndReplyNotifications(BUILDERFI_FARCASTER_FID, {
    limit: 150
  });
  // TODO: fetch publishedBefore from the last time we checked (stored in a db)
  const publishedBefore = Date.now() - 1000 * 120; // 2 minutes

  const mentionNotifications = result.notifications?.filter(
    n =>
      // notifications that are mentions
      n.type === "cast-mention" &&
      // notifications that have been published after the last time we checked
      parseInt(n.timestamp, 10) > publishedBefore &&
      // notifications that have only one mention (the recipient of the question)
      n.mentionedProfiles?.filter(p => p.fid !== BUILDERFI_FARCASTER_FID)?.length === 1
  );

  const questions = await getQuestionsFromNotifications(mentionNotifications as unknown as CastWithInteractionsV2[]);

  await Promise.all(
    questions.map(q => prepareQuestion(q.recipientUsername, q.questionContent, q.recipientUsername, q.castHash))
  );

  const mostRecentTimestamp = mentionNotifications[0].timestamp;
  // TODO: store mostRecentTimestamp on DB
};

const getQuestionsFromNotifications = async (
  notifications: CastWithInteractionsV2[]
): { questionerUsername: string; recipientUsername: string; questionContent: string; castHash: string }[] => {
  const parsedNotifications = notifications
    .map(notification => ({
      authorUsername: notification.author.username,
      authorFid: notification.author.fid,
      mentionedProfiles: (notification as unknown as CastWithInteractionsV1).mentionedProfiles
        ?.map(profile => ({
          username: profile.username,
          fid: profile.fid
        }))
        .filter(p => p.fid !== BUILDERFI_FARCASTER_FID),
      timestamp: notification.timestamp,
      text: notification.text,
      castHash: notification.hash
    }))
    // cause we want casts that mention only builder.fi and one other user
    .filter(n => n.mentionedProfiles.length === 1);

  // TODO: integrate with OpenAI here
  // authorUsername is questionerUsername
  // recipientUsername is mentionedProfile.username
  // questionContent is text, but we need to ask OpenAI to extract just the question from the text
  // castHash is notification.hash
};

const prepareQuestion = async (
  questionAuthorUsername: string,
  questionContent: string,
  questionRecipientUsername: string,
  questionCastHash: string
) => {
  const questionAuthor = await prisma.socialProfile.findFirst({
    where: { profileName: questionAuthorUsername, type: SocialProfileType.FARCASTER },
    include: { user: true }
  });
  const questionRecipient = await prisma.socialProfile.findFirst({
    where: { profileName: questionRecipientUsername, type: SocialProfileType.FARCASTER },
    include: { user: true }
  });
  if (!questionAuthor || !questionRecipient) {
    return null;
  }
  const newQuestion = await prisma.question.create({
    data: {
      questionContent,
      questionerId: questionAuthor.userId,
      replierId: questionRecipient.userId
    }
  });
  await replyToNewQuestionCast(
    questionCastHash,
    `https://app.builder.fi/profile/${questionRecipient.user.wallet}?question=${newQuestion.id}`
  );
};
