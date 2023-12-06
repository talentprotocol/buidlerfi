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

const NEW_BUILDERFI_QUESTION_CAST =
  "@{questionAuthor} just asked @{questionRecipient} a question on builder.fi!\n\n{link}";
const NEW_BUILDERFI_QUESTION_PARENT_CAST_HASH = "0x311091ebeef4e0ba4cbbeb5c7d7f46019a747c06";

const NEW_BUILDERFI_ANSWER_CAST = "@{replyAuthor} just answered @{questionAuthor} question on builder.fi!\n\n{link}";
const NEW_BUILDERFI_ANSWER_PARENT_CAST_HASH = "0x311091ebeef4e0ba4cbbeb5c7d7f46019a747c06";

const NEW_BUILDERFI_USER_CAST = "@{user} just launched their keys on builder.fi!\n\n{link}";
const NEW_BUILDERFI_USER_PARENT_CAST_HASH = "0x203126fea3987996b1032f72ed70d28c9f5663c5";

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
