import {
  BUILDERFI_LENS_APP_ID,
  BUILDERFI_LENS_PROFILE_ID,
  NEW_BUILDERFI_ANSWER_POST,
  NEW_BUILDERFI_ANSWER_POST_TITLE,
  NEW_BUILDERFI_QUESTION_POST,
  NEW_BUILDERFI_QUESTION_POST_TITLE,
  NEW_BUILDERFI_USER_POST,
  NEW_BUILDERFI_USER_POST_TITLE
} from "@/lib/constants";
import { getAccount } from "@/lib/viemServer";
import { LensClient, production } from "@lens-protocol/client";
import { textOnly } from "@lens-protocol/metadata";
import { uploadJSONToIPFS } from "../common/pinata";

/* eslint-disable camelcase */
interface Lens {
  id: string;
  appId: string;
  locale: string;
  mainContentFocus: string;
  image: {
    item: string;
    type: string;
  };
  title: string;
  content: string;
}

interface Attachment {
  cover: string;
  item: string;
  type: string;
}

export interface Post {
  description: string;
  external_url: string;
  name: string;
  animation_url: string;
  $schema: string;
  lens: Lens;
  attachments: Attachment[];
}

export const preparePostMetadata = (title: string, description: string, content: string, external_url: string) =>
  textOnly({
    content,
    appId: BUILDERFI_LENS_APP_ID,
    marketplace: {
      description,
      external_url,
      name: title
    }
  });

export const publishLensPost = async (title: string, description: string, content: string, externalUrl: string) => {
  const wallet = await getAccount(process.env.WALLET_PRIVATE_KEY as string);
  const lensClient = new LensClient({
    environment: production
  });
  const { id, text } = await lensClient.authentication.generateChallenge({
    signedBy: wallet.address,
    for: BUILDERFI_LENS_PROFILE_ID
  });
  const signature = await wallet.signMessage({ message: text });
  await lensClient.authentication.authenticate({
    id, // returned from authentication.generateChallenge 
    signature
  });
  const metadata = preparePostMetadata(title, description, content, externalUrl);

  const { IpfsHash } = await uploadJSONToIPFS(title, metadata);
  return await lensClient.publication.postOnchain({
    contentURI: `ipfs://${IpfsHash}` // or arweave
  });
};

export const publishNewQuestionLensPost = async (questionAuthor: string, questionRecipient: string, link: string) => {
  const text = NEW_BUILDERFI_QUESTION_POST.replace("{questionAuthor}", questionAuthor)
    .replace("{questionRecipient}", questionRecipient)
    .replace("{link}", link);
  return publishLensPost(NEW_BUILDERFI_QUESTION_POST_TITLE, text, text, link);
};

export const publishNewAnswerLensPost = async (replyAuthor: string, questionAuthor: string, link: string) => {
  const text = NEW_BUILDERFI_ANSWER_POST.replace("{replyAuthor}", replyAuthor)
    .replace("{questionAuthor}", questionAuthor)
    .replace("{link}", link);
  return publishLensPost(NEW_BUILDERFI_ANSWER_POST_TITLE, text, text, link);
};

export const publishNewUserKeysLensPost = async (user: string, link: string) => {
  const text = NEW_BUILDERFI_USER_POST.replace("{user}", user).replace("{link}", link);
  return publishLensPost(NEW_BUILDERFI_USER_POST_TITLE, text, text, link);
};
