import {
  NEW_BUILDERFI_ANSWER_CAST,
  NEW_BUILDERFI_ANSWER_PARENT_CAST_HASH,
  NEW_BUILDERFI_QUESTION_CAST,
  NEW_BUILDERFI_QUESTION_PARENT_CAST_HASH,
  NEW_BUILDERFI_USER_CAST,
  NEW_BUILDERFI_USER_PARENT_CAST_HASH
} from "@/lib/constants";
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

export const getCastUrl = (castHash: string) => `https://warpcast.com/~/conversations/${castHash}`;
