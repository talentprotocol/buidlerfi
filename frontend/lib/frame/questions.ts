import { addReaction } from "@/backend/question/question";
import { ReactionType, SocialProfileType } from "@prisma/client";
import { BASE_URL } from "../constants";
import prisma from "../prisma";

export const getQuestionImageUrl = (questionId: string | number, upvoted?: boolean) =>
  `${BASE_URL}/api/frame/image?id=${questionId}${upvoted ? "&upvoted=true" : ""}`;

export const upvoteQuestion = async (username: string, questionId: number) => {
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
  const { user } = socialProfiles;
  await addReaction(user.privyUserId!, questionId, ReactionType.UPVOTE);
};
