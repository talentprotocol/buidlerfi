import {
  FARCASTER_BUILDERFI_CHANNEL_ID,
  NEW_BUILDERFI_ANSWER_CAST,
  NEW_BUILDERFI_ANSWER_PARENT_CAST_HASH,
  NEW_BUILDERFI_BUY_TRADE_CAST,
  NEW_BUILDERFI_KEY_TRADE_PARENT_CAST_HASH,
  NEW_BUILDERFI_QUESTION_CAST,
  NEW_BUILDERFI_QUESTION_PARENT_CAST_HASH,
  NEW_BUILDERFI_QUESTION_REPLY_CAST,
  NEW_BUILDERFI_QUESTION_REPLY_CAST_NOT_KEY_HOLDER,
  NEW_BUILDERFI_QUESTION_REPLY_CAST_NO_AUTHOR_ERROR,
  NEW_BUILDERFI_QUESTION_REPLY_CAST_NO_USER_ERROR,
  NEW_BUILDERFI_SELL_TRADE_CAST,
  NEW_BUILDERFI_USER_CAST,
  NEW_BUILDERFI_USER_PARENT_CAST_HASH,
  TOP_FARCASTER_USERS_BY_KEY_HOLDERS_CAST,
  TOP_FARCASTER_USERS_BY_KEY_VALUE_CAST,
  TOP_FARCASTER_USERS_BY_NUMBER_ANSWERS_CAST,
  TOP_FARCASTER_USERS_BY_NUMBER_QUESTIONS_CAST,
  TOP_QUESTION_UPVOTE_BY_WEEK_CAST
} from "@/lib/constants";
import { shortAddress } from "@/lib/utils";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { SocialProfile, User } from "@prisma/client";

export const publishCast = async (text: string, channelId?: string, embedUrl?: string) => {
  if (!process.env.FARCASTER_API_KEY || !process.env.FARCASTER_SIGNER_UUID) {
    throw new Error("FARCASTER_API_KEY and FARCASTER_SIGNER_UUID must be set in the environment");
  }
  if (process.env.ENABLE_FARCASTER === "false") {
    return;
  }
  const signerUuid = process.env.FARCASTER_SIGNER_UUID as string;
  const client = new NeynarAPIClient(process.env.FARCASTER_API_KEY as string);

  const publishedCast = await client.publishCast(signerUuid, text, {
    channelId,
    embeds: embedUrl ? [{ url: embedUrl }] : []
  });

  console.log(`New cast hash: ${publishedCast.hash}`);

  return publishedCast.hash;
};

export const replyToCast = async (existingCastHash: string, reply: string, embedUrl?: string) => {
  if (!process.env.FARCASTER_API_KEY || !process.env.FARCASTER_SIGNER_UUID) {
    throw new Error("FARCASTER_API_KEY and FARCASTER_SIGNER_UUID must be set in the environment");
  }
  if (process.env.ENABLE_FARCASTER === "false") {
    return;
  }
  const signerUuid = process.env.FARCASTER_SIGNER_UUID as string;
  const client = new NeynarAPIClient(process.env.FARCASTER_API_KEY as string);

  const publishedCast = await client.publishCast(signerUuid, reply, {
    replyTo: existingCastHash,
    embeds: embedUrl ? [{ url: embedUrl }] : []
  });

  console.log(`Reply hash:${publishedCast.hash}`);

  return publishedCast.hash;
};

export const publishNewQuestionCast = async (questionAuthor: string, questionRecipient: string, link: string) => {
  const text = NEW_BUILDERFI_QUESTION_CAST.replace("{questionAuthor}", questionAuthor).replace(
    "{questionRecipient}",
    questionRecipient
  );
  return replyToCast(NEW_BUILDERFI_QUESTION_PARENT_CAST_HASH, text, link);
};

export const publishNewAnswerCast = async (replyAuthor: string, questionAuthor: string, link: string) => {
  const text = NEW_BUILDERFI_ANSWER_CAST.replace("{replyAuthor}", replyAuthor).replace(
    "{questionAuthor}",
    questionAuthor
  );
  return replyToCast(NEW_BUILDERFI_ANSWER_PARENT_CAST_HASH, text, link);
};

export const publishNewUserKeysCast = async (user: string, link: string) => {
  const text = NEW_BUILDERFI_USER_CAST.replace("{user}", user);
  return replyToCast(NEW_BUILDERFI_USER_PARENT_CAST_HASH, text, link);
};

export const publishBuyTradeUserKeysCast = async (holder: string, owner: string, price: string, link: string) => {
  const text = NEW_BUILDERFI_BUY_TRADE_CAST.replace("{holder}", holder)
    .replace("{owner}", owner)
    .replace("{price}", price);
  return replyToCast(NEW_BUILDERFI_KEY_TRADE_PARENT_CAST_HASH, text, link);
};

export const publishSellTradeUserKeysCast = async (holder: string, owner: string, price: string, link: string) => {
  const text = NEW_BUILDERFI_SELL_TRADE_CAST.replace("{holder}", holder)
    .replace("{owner}", owner)
    .replace("{price}", price);
  return replyToCast(NEW_BUILDERFI_KEY_TRADE_PARENT_CAST_HASH, text, link);
};

export const publishTopFarcasterKeyValueCast = async (data: { username: string; price: string }[]) => {
  await publishRankingOnCast(data, TOP_FARCASTER_USERS_BY_KEY_VALUE_CAST, "price", "ETH");
};

export const publishTopFarcasterKeyHoldersCast = async (data: { username: string; numHolders: number }[]) => {
  await publishRankingOnCast(data, TOP_FARCASTER_USERS_BY_KEY_HOLDERS_CAST, "numHolders", "holders");
};

export const publishTopFarcasterQuestionsCast = async (data: { username: string; numQuestions: number }[]) => {
  await publishRankingOnCast(data, TOP_FARCASTER_USERS_BY_NUMBER_QUESTIONS_CAST, "numQuestions", "questions");
};

export const publishTopFarcasterAnswersCast = async (data: { username: string; numAnswers: number }[]) => {
  await publishRankingOnCast(data, TOP_FARCASTER_USERS_BY_NUMBER_ANSWERS_CAST, "numAnswers", "answers");
};

export const publishQuestionsOfTheWeekCast = async (
  content: string,
  questioner: string,
  replier: string,
  link: string
) => {
  const text = TOP_QUESTION_UPVOTE_BY_WEEK_CAST.replace("{questionContent}", content)
    .replace("{questioner}", questioner)
    .replace("{replier}", replier);
  console.log(text);
  return replyToCast(NEW_BUILDERFI_KEY_TRADE_PARENT_CAST_HASH, text, link);
};

export const replyToNewQuestionCastSuccess = async (castHash: string, link: string) => {
  const text = NEW_BUILDERFI_QUESTION_REPLY_CAST;
  return replyToCast(castHash, text, link);
};

export const replyToNewQuestionErrorNoAuthor = async (castHash: string, username: string) => {
  const text = `${NEW_BUILDERFI_QUESTION_REPLY_CAST_NO_AUTHOR_ERROR.replace("{username}", username)}`;
  return replyToCast(castHash, text);
};

export const replyToNewQuestionErrorNoUser = async (castHash: string, username: string) => {
  const text = `${NEW_BUILDERFI_QUESTION_REPLY_CAST_NO_USER_ERROR.replace("{username}", username)}`;
  return replyToCast(castHash, text);
};

export const replyToNewQuestionErrorNotKeyHolder = async (castHash: string, username: string, link: string) => {
  const text = `${NEW_BUILDERFI_QUESTION_REPLY_CAST_NOT_KEY_HOLDER.replace("{username}", username)}`;
  return replyToCast(castHash, text, link);
};

export const getCastUrl = (castHash: string) => `https://warpcast.com/~/conversations/${castHash}`;

export const getFarcasterProfileName = (profile: User, socialProfile?: SocialProfile) => {
  return socialProfile?.profileName
    ? `@${socialProfile?.profileName}`
    : profile.displayName || shortAddress(profile.wallet || "");
};

const publishRankingOnCast = async (
  data: { username: string; [key: string]: string | number }[],
  text: string,
  valueKey: string,
  label: string
) => {
  const top3 = data
    .slice(0, 3)
    .map((d, index) => `${index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} @${d.username} - ${d[valueKey]} ${label}`);
  const rest = data.slice(3);

  const rootText = `${text}\n\n${top3.join("\n")}${data.length > 3 ? "\n\ncontinues...👇" : ""}`;
  const rootCast = await publishCast(rootText, FARCASTER_BUILDERFI_CHANNEL_ID);

  console.log(rootText);

  if (data.length > 3) {
    const firstReplyText = `${rest
      .slice(0, 3)
      .map((d, index) => `${index + 4}. @${d.username} - ${d[valueKey]} ${label}`)
      .join("\n\n")}${data.length > 6 ? "\n\ncontinues...👇" : ""}`;
    const firstReplyCast = await replyToCast(rootCast!, firstReplyText);

    console.log(firstReplyText);

    if (data.length > 6) {
      const secondReplyText = `${rest
        .slice(3, 6)
        .map((d, index) => `${index + 7}. @${d.username} - ${d[valueKey]} ${label}`)
        .join("\n\n")}`;
      await replyToCast(firstReplyCast!, secondReplyText);

      console.log(secondReplyText);
    }
  }
};
