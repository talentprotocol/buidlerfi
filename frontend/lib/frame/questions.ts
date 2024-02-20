import { createComment } from "@/backend/comment/comment";
import { addReaction } from "@/backend/question/question";
import { getUser } from "@/backend/user/user";
import { ReactionType, SocialProfileType } from "@prisma/client";
import { BASE_URL } from "../constants";
import prisma from "../prisma";

export type GetQuestionImageType = {
  questionId: string | number;
  privyUserId?: string | number;
  upvoted?: boolean;
  downvoted?: boolean;
  replied?: boolean;
  userNotSignedUp?: boolean;
  isReply?: boolean;
  ownKeys?: boolean;
};

export const getQuestionImageUrl = ({
  questionId,
  privyUserId = undefined,
  upvoted = false,
  downvoted = false,
  replied = false,
  userNotSignedUp = false,
  isReply = false,
  ownKeys = false
}: GetQuestionImageType) =>
  `${BASE_URL}/api/frame/image?id=${questionId}${upvoted ? "&upvoted=true" : ""}${downvoted ? "&downvoted=true" : ""}${
    replied ? "&replied=true" : ""
  }${userNotSignedUp ? "&userNotSignedUp=true" : ""}${isReply ? "&isReply=true" : ""}${ownKeys ? "&ownKeys=true" : ""}${
    privyUserId ? "&privyUserId=" + privyUserId : ""
  }`;

const getSocialProfile = async (username: string) => {
  const socialProfiles = await prisma.socialProfile.findFirst({
    where: {
      profileName: username,
      type: SocialProfileType.FARCASTER
    },
    include: {
      user: true
    }
  });
  if (!socialProfiles) {
    throw new Error("No social profile found");
  }
  return socialProfiles;
};

export const upvoteQuestion = async (username: string, questionId: number) => {
  const { user } = await getSocialProfile(username);
  await addReaction(user.privyUserId!, questionId, ReactionType.UPVOTE);
};

export const downvoteQuestion = async (username: string, questionId: number) => {
  const { user } = await getSocialProfile(username);
  const { error } = await getUser(user.privyUserId!);
  if (error != null) {
    console.error("error downvoting", error);
    return;
  }
  await addReaction(user.privyUserId!, questionId, ReactionType.DOWNVOTE);
};

export const commentQuestion = async (username: string, questionId: number, comment: string) => {
  const { user } = await getSocialProfile(username);
  await createComment(user.privyUserId!, questionId, comment);
};
