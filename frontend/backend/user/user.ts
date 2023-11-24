"use server";

import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import privyClient from "@/lib/privyClient";
import viemClient from "@/lib/viemClient";
import { Wallet } from "@privy-io/server-auth";
import { differenceInMinutes } from "date-fns";
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
      points: true
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

export const getRecommendedUser = async (wallet: string) => {
  const address = wallet.toLowerCase();
  const res = await prisma.recommendedUser.findFirst({
    where: {
      wallet: address
    }
  });

  if (!res) return { error: ERRORS.USER_NOT_FOUND };

  return { data: res };
};

export const createUser = async (privyUserId: string, inviteCode: string) => {
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
  } catch (err) {
    console.error("Error while updating social profiles: ", err);
  }

  return { data: user };
};

export interface UpdateUserArgs {
  hasFinishedOnboarding?: boolean;
  displayName?: string;
}

export const updateUser = async (privyUserId: string, updatedUser: UpdateUserArgs) => {
  const existingUser = await prisma.user.findUniqueOrThrow({
    where: { privyUserId: privyUserId },
    include: { socialProfiles: true }
  });

  if (updatedUser.displayName !== undefined) {
    //Only allow updating display name if no socialProfile found for user.
    if (existingUser.socialProfiles.length > 0) {
      return { error: ERRORS.INVALID_REQUEST };
    }

    if (!/^[A-Za-z][A-Za-z0-9_.]{2,19}$/.test(updatedUser.displayName)) {
      return { error: ERRORS.USERNAME_INVALID_FORMAT };
    }
  }

  if (updatedUser.hasFinishedOnboarding) {
    //Check if user has a display name. Should fail otherwise.
    //We just need to check if displayName is empty or not. If it's defined, it will be checked by the above code.
    if (!existingUser.displayName && !updatedUser.displayName) {
      return { error: ERRORS.INVALID_REQUEST };
    }
  }

  const res = await prisma.user.update({
    where: { privyUserId: privyUserId },
    data: {
      hasFinishedOnboarding: updatedUser.hasFinishedOnboarding,
      displayName: updatedUser.displayName
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
  const usersWithReplyCount = await prisma.user.findMany({
    where: { wallet: { in: addresses }, isActive: true, hasFinishedOnboarding: true },
    include: { _count: { select: { replies: { where: { repliedOn: { not: null } } } } } }
  });

  // prisma does not allow two counts on the same relation ship, so we need to do this manually
  const usersWithQuestionsCount = await prisma.user.findMany({
    where: { wallet: { in: addresses }, isActive: true, hasFinishedOnboarding: true },
    include: { _count: { select: { replies: true } } }
  });

  // the goal is to show the number of questions asked vs the number of questions answered
  // since the replierId is always set, we can use that to count the number of questions asked
  // and the number of questions answered is the number of questions with a non null repliedOn
  const mergedUsers = usersWithReplyCount.map(user => ({
    ...user,
    _count: {
      ...user._count,
      questions: usersWithQuestionsCount.find(u => u.wallet === user.wallet)?._count.replies
    }
  }));

  return {
    data: mergedUsers
  };
};

export const getRecommendedUsers = async (address: string) => {
  const user = await prisma.user.findUnique({ where: { wallet: address.toLowerCase() } });
  if (!user) return { error: ERRORS.USER_NOT_FOUND };

  const recommendations = await prisma.recommendedUser.findMany({
    where: { forId: user.id },
    orderBy: { recommendationScore: "desc" },
    include: { user: { include: { _count: { select: { replies: { where: { repliedOn: { not: null } } } } } } } }
  });

  const usersWithQuestionsCount = await prisma.user.findMany({
    where: { id: { in: recommendations.map(i => i.id) }, isActive: true, hasFinishedOnboarding: true },
    include: { _count: { select: { replies: true } } }
  });

  const mergedRecommendedUsers = recommendations.map(user => {
    if (!user.user) {
      return user;
    }

    return {
      ...user,
      user: {
        ...user.user,
        _count: {
          ...user.user._count,
          questions: usersWithQuestionsCount.find(u => u.id === user.id)?._count.replies
        }
      }
    };
  });

  return {
    data: mergedRecommendedUsers
  };
};
