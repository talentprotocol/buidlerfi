import { createComment } from "@/backend/comment/comment";
import { addReaction } from "@/backend/question/question";
import { ReactionType, SocialProfileType } from "@prisma/client";
import { BASE_URL } from "../constants";
import prisma from "../prisma";

export const getQuestionImageUrl = (questionId: string | number, upvoted?: boolean) =>
  `${BASE_URL}/api/frame/image?id=${questionId}${upvoted ? "&upvoted=true" : ""}`;

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

export const commentQuestion = async (username: string, questionId: number, comment: string) => {
  const { user } = await getSocialProfile(username);
  await createComment(user.privyUserId!, questionId, comment);
};
