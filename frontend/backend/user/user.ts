"use server";

import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import privyClient from "@/lib/privyClient";
import { Wallet } from "@privy-io/server-auth";
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
      wallet: {
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

export const linkNewWallet = async (privyUserId: string, newWallet: string) => {
  const existingUser = await prisma.user.findUnique({ where: { privyUserId: privyUserId } });
  if (!existingUser) {
    return { error: ERRORS.USER_NOT_FOUND };
  }

  //We need to verify if wallet has been linked to privy
  // const privyUser = await privyClient.getUserByWalletAddress(newWallet);
  // const prUser = await privyClient.getUser(privyUserId);

  // if (!privyUser || privyUser.id !== existingUser.privyUserId) {
  //   return { error: ERRORS.PRIVY_WALLET_NOT_FOUND };
  // }

  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      socialWallet: newWallet.toLowerCase()
    }
  });

  try {
    await updateUserSocialProfiles(user.id, newWallet.toLowerCase());
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
  if (updatedUser.displayName) {
    //Only allow updating display name if no socialProfile found for user.
    const existingUser = await prisma.user.findUnique({
      where: { privyUserId: privyUserId },
      include: { socialProfiles: true }
    });
    if (!existingUser) {
      return { error: ERRORS.USER_NOT_FOUND };
    }
    if (existingUser.socialProfiles.length > 0) {
      return { error: ERRORS.INVALID_REQUEST };
    }

    if (!/^[A-Za-z][A-Za-z0-9_.]{2,19}$/.test(updatedUser.displayName)) {
      return { error: ERRORS.USERNAME_INVALID_FORMAT };
    }
  }

  const res = prisma.user.update({
    where: { privyUserId: privyUserId },
    data: {
      hasFinishedOnboarding: updatedUser.hasFinishedOnboarding,
      displayName: updatedUser.displayName
    }
  });

  return { data: res };
};
