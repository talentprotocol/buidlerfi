"use server";

import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import privyClient from "@/lib/privyClient";
import { ipfsToURL } from "@/lib/utils";
import viemClient from "@/lib/viemClient";
import { Wallet } from "@privy-io/server-auth";
import { differenceInMinutes } from "date-fns";
import { updateRecommendations } from "../socialProfile/recommendation";
import { updateUserSocialProfiles } from "../socialProfile/socialProfile";

export const refreshAllUsersProfile = async () => {
  const users = await prisma.user.findMany();
  for (const user of users.filter(user => user.socialWallet)) {
    try {
      await updateUserSocialProfiles(user.id, user.socialWallet!);
    } catch (err) {
      console.error("Error while updating social profiles for user: ", user.wallet, err);
    }
  }
  return { data: users };
};

//Refresh socials profiles
export const refreshCurrentUserProfile = async (privyUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    }
  });

  if (!user) return { error: ERRORS.USER_NOT_FOUND };
  if (!user.socialWallet) return { error: ERRORS.NO_SOCIAL_PROFILE_FOUND };

  const res = await updateUserSocialProfiles(user.id, user.socialWallet);
  updateRecommendations(user.socialWallet.toLowerCase());
  return { data: res };
};

export const getCurrentUser = async (privyUserId: string) => {
  const res = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    },
    include: {
      inviteCodes: {
        where: {
          isActive: true
        }
      },
      socialProfiles: true,
      points: true,
      tags: true
    }
  });

  return { data: res };
};

export const checkUsersExist = async (wallets: string[]) => {
  const addresses = wallets.map(wallet => wallet.toLowerCase());
  const res = await prisma.user.findMany({
    where: {
      socialWallet: {
        in: addresses
      }
    }
  });
  return { data: res };
};

export const getUser = async (wallet: string) => {
  const address = wallet.toLowerCase();
  const res = await prisma.user.findUnique({
    where: {
      wallet: address
    },
    include: {
      socialProfiles: true
    }
  });

  if (!res) return { error: ERRORS.USER_NOT_FOUND };

  return { data: res };
};

export const createUser = async (privyUserId: string, inviteCode: string) => {
  inviteCode = inviteCode.trim();

  const privyUser = await privyClient.getUser(privyUserId);
  if (!privyUser) {
    return { error: ERRORS.UNAUTHORIZED };
  }

  const existingUser = await prisma.user.findUnique({ where: { privyUserId: privyUserId } });
  if (existingUser) {
    return { error: ERRORS.USER_ALREADY_EXISTS };
  }

  const embeddedWallet = privyUser.linkedAccounts.find(
    account => account.type === "wallet" && account.walletClientType === "privy" && account.connectorType === "embedded"
  ) as Wallet;

  if (!embeddedWallet) {
    return { error: ERRORS.WALLET_MISSING };
  }

  const address = embeddedWallet.address.toLowerCase();

  const existingCode = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
  if (!existingCode || existingCode.isActive === false) {
    return { error: ERRORS.INVALID_INVITE_CODE };
  }

  if (existingCode.used >= existingCode.maxUses) {
    return { error: ERRORS.CODE_ALREADY_USED };
  }

  const newUser = await prisma.$transaction(async tx => {
    const newUser = await tx.user.create({
      data: {
        privyUserId: privyUser.id,
        invitedById: existingCode.id,
        wallet: address,
        isActive: true
      }
    });

    await tx.inviteCode.update({
      where: { id: existingCode.id },
      data: {
        used: existingCode.used + 1
      }
    });

    return newUser;
  });

  return { data: newUser };
};

export const linkNewWallet = async (privyUserId: string, signedMessage: string) => {
  const existingUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId: privyUserId } });

  const challenge = await prisma.signingChallenge.findFirstOrThrow({
    where: {
      userId: existingUser.id
    }
  });

  if (Math.abs(differenceInMinutes(new Date(), challenge.updatedAt)) > 15) {
    return { error: ERRORS.CHALLENGE_EXPIRED };
  }

  const verified = await viemClient.verifyMessage({
    address: challenge.publicKey as `0x${string}`,
    message: challenge.message,
    signature: signedMessage as `0x${string}`
  });

  if (!verified) {
    return { error: ERRORS.INVALID_SIGNATURE };
  }

  const user = await prisma.$transaction(async tx => {
    //Clear challenge
    await tx.signingChallenge.delete({
      where: {
        userId: existingUser.id
      }
    });

    return await tx.user.update({
      where: { id: existingUser.id },
      data: {
        socialWallet: challenge.publicKey.toLowerCase()
      }
    });
  });

  try {
    await updateUserSocialProfiles(user.id, challenge.publicKey.toLowerCase());
    updateRecommendations(challenge.publicKey.toLowerCase());
  } catch (err) {
    console.error("Error while updating social profiles: ", err);
  }

  return { data: user };
};

export interface UpdateUserArgs {
  tags?: string[];
  hasFinishedOnboarding?: boolean;
}

export const updateUser = async (privyUserId: string, updatedUser: UpdateUserArgs) => {
  if (updatedUser.tags && updatedUser.tags.length > 3) {
    return { error: ERRORS.TAGS_COUNT_INVALID };
  }

  const existingUser = await prisma.user.findUniqueOrThrow({
    where: { privyUserId: privyUserId },
    include: { socialProfiles: true, tags: true }
  });

  const res = await prisma.user.update({
    where: { privyUserId: privyUserId },
    data: {
      hasFinishedOnboarding: updatedUser.hasFinishedOnboarding,
      tags: updatedUser.tags
        ? {
            disconnect: existingUser.tags.map(tag => ({ id: tag.id })),
            connect: updatedUser.tags.map(tag => ({ name: tag }))
          }
        : undefined
    }
  });

  return { data: res };
};

export const generateChallenge = async (privyUserId: string, publicKey: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId
    }
  });

  const challenge = `
I'm verifying the ownership of this wallet for builderfi.
Timestamp: ${Date.now()}
Wallet: ${publicKey}
  `;

  const res = await prisma.signingChallenge.upsert({
    where: {
      userId: user.id
    },
    update: {
      message: challenge,
      publicKey
    },
    create: {
      message: challenge,
      userId: user.id,
      publicKey
    }
  });

  return { data: res };
};

export const getBulkUsers = async (addresses: string[]) => {
  // get all users
  const usersWithReplies = await prisma.user.findMany({
    where: { wallet: { in: addresses }, isActive: true, hasFinishedOnboarding: true, displayName: { not: null } },
    include: { replies: true }
  });

  // split the count of replies and questions
  const users = usersWithReplies.map(user => ({
    ...user,
    questions: user.replies.length,
    replies: user.replies.filter(reply => !!reply.repliedOn).length
  }));

  return {
    data: users
  };
};

const sanitizeAvatarUrl = (avatarUrl: string) => {
  if (!avatarUrl) return avatarUrl;

  if (avatarUrl.includes("talentprotocol")) {
    const imageUrl = new URL(avatarUrl);
    return imageUrl.origin + imageUrl.pathname;
  }

  if (avatarUrl.includes("ipfs://")) {
    return ipfsToURL(avatarUrl);
  }

  return avatarUrl;
};

export const getRecommendedUsers = async (address: string) => {
  if (!address) return { data: [] };

  const user = await prisma.user.findUnique({ where: { wallet: address.toLowerCase() } });
  if (!user) return { error: ERRORS.USER_NOT_FOUND };

  const recommendations = await prisma.recommendedUser.findMany({
    where: { forId: user.id },
    orderBy: { recommendationScore: "desc" }
  });

  const usersFromRecommendations = await prisma.user.findMany({
    where: { socialWallet: { in: recommendations.map(rec => rec.wallet).filter(i => i !== null) as string[] } },
    include: { replies: true }
  });

  const users = recommendations.map(rec => {
    const foundUser = usersFromRecommendations.find(u => u.socialWallet === rec.wallet);
    return {
      ...rec,
      avatarUrl: sanitizeAvatarUrl(rec.avatarUrl || ""),
      wallet: foundUser?.wallet || rec.wallet,
      socialWallet: rec.wallet,
      userId: !!foundUser ? foundUser.id : rec.userId,
      questions: !!foundUser ? foundUser.replies.length : 0,
      replies: !!foundUser ? foundUser.replies.filter(reply => !!reply.repliedOn).length : 0,
      createdAt: !!foundUser ? foundUser.createdAt : rec.createdAt
    };
  });

  return {
    data: users
  };
};

export const getRecommendedUser = async (wallet: string) => {
  if (!wallet) return { data: undefined };

  const address = wallet.toLowerCase();
  const res = await prisma.recommendedUser.findFirst({
    where: {
      wallet: address
    }
  });

  if (!res) return { error: ERRORS.USER_NOT_FOUND };

  return { data: { ...res, avatarUrl: sanitizeAvatarUrl(res.avatarUrl || "") } };
};
