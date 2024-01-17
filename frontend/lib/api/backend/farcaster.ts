import {
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
  NEW_BUILDERFI_USER_PARENT_CAST_HASH
} from "@/lib/constants";
import { shortAddress } from "@/lib/utils";
import { SocialProfile, User } from "@prisma/client";
import { NeynarAPIClient } from "@standard-crypto/farcaster-js-neynar";

export const publishCast = async (text: string) => {
  if (!process.env.FARCASTER_API_KEY || !process.env.FARCASTER_SIGNER_UUID) {
    throw new Error("FARCASTER_API_KEY and FARCASTER_SIGNER_UUID must be set in the environment");
  }
  const signerUuid = process.env.FARCASTER_SIGNER_UUID as string;
  const client = new NeynarAPIClient(process.env.FARCASTER_API_KEY as string);

  const publishedCast = await client.v2.publishCast(signerUuid, text);

  console.log(`New cast hash: ${publishedCast.hash}`);

  return publishedCast.hash;
};

export const replyToCast = async (existingCastHash: string, reply: string) => {
  if (!process.env.FARCASTER_API_KEY || !process.env.FARCASTER_SIGNER_UUID) {
    throw new Error("FARCASTER_API_KEY and FARCASTER_SIGNER_UUID must be set in the environment");
  }
  const signerUuid = process.env.FARCASTER_SIGNER_UUID as string;
  const client = new NeynarAPIClient(process.env.FARCASTER_API_KEY as string);

  const publishedCast = await client.v2.publishCast(signerUuid, reply, { replyTo: existingCastHash });

  console.log(`Reply hash:${publishedCast.hash}`);

  return publishedCast.hash;
};

export const publishNewQuestionCast = async (questionAuthor: string, questionRecipient: string, link: string) => {
  const text = NEW_BUILDERFI_QUESTION_CAST.replace("{questionAuthor}", questionAuthor)
    .replace("{questionRecipient}", questionRecipient)
    .replace("{link}", link);
  return replyToCast(NEW_BUILDERFI_QUESTION_PARENT_CAST_HASH, text);
};

export const publishNewAnswerCast = async (replyAuthor: string, questionAuthor: string, link: string) => {
  const text = NEW_BUILDERFI_ANSWER_CAST.replace("{replyAuthor}", replyAuthor)
    .replace("{questionAuthor}", questionAuthor)
    .replace("{link}", link);
  return replyToCast(NEW_BUILDERFI_ANSWER_PARENT_CAST_HASH, text);
};

export const publishNewUserKeysCast = async (user: string, link: string) => {
  const text = NEW_BUILDERFI_USER_CAST.replace("{user}", user).replace("{link}", link);
  return replyToCast(NEW_BUILDERFI_USER_PARENT_CAST_HASH, text);
};

export const publishBuyTradeUserKeysCast = async (holder: string, owner: string, price: string, link: string) => {
  const text = NEW_BUILDERFI_BUY_TRADE_CAST.replace("{holder}", holder)
    .replace("{owner}", owner)
    .replace("{link}", link)
    .replace("{price}", price);
  return replyToCast(NEW_BUILDERFI_KEY_TRADE_PARENT_CAST_HASH, text);
};

export const publishSellTradeUserKeysCast = async (holder: string, owner: string, price: string, link: string) => {
  const text = NEW_BUILDERFI_SELL_TRADE_CAST.replace("{holder}", holder)
    .replace("{owner}", owner)
    .replace("{link}", link)
    .replace("{price}", price);
  return replyToCast(NEW_BUILDERFI_KEY_TRADE_PARENT_CAST_HASH, text);
};

export const replyToNewQuestionCastSuccess = async (castHash: string, link: string) => {
  const text = `${NEW_BUILDERFI_QUESTION_REPLY_CAST.replace("{link}", link)}`;
  return replyToCast(castHash, text);
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
  const text = `${NEW_BUILDERFI_QUESTION_REPLY_CAST_NOT_KEY_HOLDER.replace("{username}", username).replace(
    "{link}",
    link
  )}`;
  return replyToCast(castHash, text);
};

export const getCastUrl = (castHash: string) => `https://warpcast.com/~/conversations/${castHash}`;

export const getFarcasterProfileName = (profile: User, socialProfile?: SocialProfile) => {
  return socialProfile?.profileName
    ? `@${socialProfile?.profileName}`
    : profile.displayName || shortAddress(profile.wallet || "");
};
