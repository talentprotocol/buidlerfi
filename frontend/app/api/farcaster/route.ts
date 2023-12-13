import {
  replyToNewQuestionCastSuccess,
  replyToNewQuestionErrorNoAuthor,
  replyToNewQuestionErrorNoUser,
  replyToNewQuestionErrorNotKeyHolder
} from "@/lib/api/backend/farcaster";
import { fetchHolders } from "@/lib/api/common/builderfi";
import { BUILDERFI_FARCASTER_FID } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { getLastProcessedMentionTimestamp, insertProcessedMention } from "@/lib/supabase/processed-mentions";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastWithInteractions as CastWithInteractionsV1 } from "@neynar/nodejs-sdk/build/neynar-api/v1";
import { CastWithInteractions as CastWithInteractionsV2 } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { SocialProfileType } from "@prisma/client";
import { OpenAI } from "openai";

export const GET = async () => {
  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);
  const { result } = await client.fetchMentionAndReplyNotifications(BUILDERFI_FARCASTER_FID, {
    limit: 150
  });
  const publishedBeforeDate = await getLastProcessedMentionTimestamp();
  const publishedBefore = publishedBeforeDate ? publishedBeforeDate.getTime() : Date.now() - 1000 * 60 * 3;

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

  if (mentionNotifications?.length >= 0) {
    const mostRecentTimestamp = mentionNotifications[0].timestamp;
    await insertProcessedMention(new Date(parseInt(mostRecentTimestamp, 10)));
  }
};

const getQuestionsFromNotifications = async (
  notifications: CastWithInteractionsV2[]
): Promise<{ questionerUsername: string; recipientUsername: string; questionContent: string; castHash: string }[]> => {
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

  const prompt = `Given a list of casts, for each cast extract the questions without modifying the text in any way. Persist the order of the questions. Returns a JSON array of objects with the following property: "question".
    This is an example of a list of casts: 
    
    Casts: 
      - "Hey @builderfi, what do you think about elon musk? @buidlerfi". 
      - "Hey @orbulo, what are the most important projects in web3 <> AI? @buidlerfi".

    Your result:
      [{ "question": "what do you think about elon musk?" }, { "question": "what are the most important projects in web3 <> AI?" }]
    
    These are the casts you need to extract the question from:
    ${parsedNotifications.map(n => `- "${n.text}"`).join("\n")}
  `;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });

  const { choices } = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        content: prompt,
        role: "user"
      }
    ],
    n: 1
  });

  if (choices.length === 0) {
    throw new Error("error while extracting questions from casts: no choices from OpenAI");
  }

  const jsonArrayString = choices[0].message.content;

  if (!jsonArrayString) {
    throw new Error("error while extracting questions from casts: no jsonArrayString from OpenAI");
  }

  try {
    const questions = JSON.parse(jsonArrayString);

    return parsedNotifications.map((notification, i) => ({
      questionContent: questions[i].question,
      questionerUsername: notification.authorUsername,
      recipientUsername: notification.mentionedProfiles[0].username,
      castHash: notification.castHash
    }));
  } catch (error) {
    throw new Error(`error while parsing questions from casts: ${error}`);
  }
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
  if (!questionAuthor) {
    return await replyToNewQuestionErrorNoAuthor(questionCastHash, questionAuthorUsername);
  }

  // check if the question recipient is on builder.fi
  // if not, reply with an error
  if (!questionRecipient) {
    return await replyToNewQuestionErrorNoUser(questionCastHash, questionRecipientUsername);
  }

  // check if the question author is a key holder of question recipient
  // i.e. check if author can actually ask questions to recipient
  const replierHolders = await fetchHolders(questionRecipient.user.wallet);
  const found = replierHolders.find(
    holder => holder.holder.owner.toLowerCase() === questionAuthor.user.wallet.toLowerCase()
  );
  // if not, reply with an error
  if (!found || Number(found.heldKeyNumber) === 0) {
    return await replyToNewQuestionErrorNotKeyHolder(
      questionCastHash,
      questionRecipientUsername,
      `https://app.builder.fi/profile/${questionRecipient.user.wallet}`
    );
  }

  // create question and reply successfully with the bot
  const newQuestion = await prisma.question.create({
    data: {
      questionContent,
      questionerId: questionAuthor.userId,
      replierId: questionRecipient.userId
    }
  });
  await replyToNewQuestionCastSuccess(
    questionCastHash,
    `https://app.builder.fi/profile/${questionRecipient.user.wallet}?question=${newQuestion.id}`
  );
};
