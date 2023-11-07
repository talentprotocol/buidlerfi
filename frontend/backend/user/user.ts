"use server";

import { ERRORS } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { generateRandomString } from "@/lib/utils";
import { privyUser } from "@/models/helpers.model";
import { GetTalentResponse } from "@/models/talentProtocol.model";
import { SocialProfileType, User } from "@prisma/client";
import axios from "axios";
import { getAirstackSocialData } from "../../lib/api/backend/airstack";
import { fetchHolders } from "../../lib/api/common/builderfi";
import { getEnsProfile } from "../../lib/api/common/ens";

//Refresh socials profiles
export const refreshCurrentUserProfile = async (privyUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    }
  });

  const res = await updateUserSocialProfiles(user!);
  return { data: res };
};

export const getCurrentUser = async (privyUserId: string) => {
  const res = await prisma.user.findUnique({
    where: {
      privyUserId: privyUserId
    },
    include: {
      inviteCodes: true,
      socialProfiles: true,
      points: true
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
  if (res) return { data: res };

  // Wallet can be found in graph if user bypassed frontend and made tx directly on the contract.
  // In that case, user will not exist in DB. So we query the graph to see if wallet has any holders.
  // And if he does, we create a new user in DB with active = false
  const holders = await fetchHolders(address);
  if (holders.length <= 0) return { error: ERRORS.USER_NOT_FOUND };

  const newUser = await prisma.user.create({
    data: {
      wallet: address,
      isActive: false
    }
  });

  const user = await updateUserSocialProfiles(newUser);

  return { data: user };
};

export const createUser = async (privyUser: privyUser, inviteCode: string) => {
  if (!privyUser || !privyUser.id || !privyUser.wallet) {
    return { error: ERRORS.INVALID_REQUEST };
  }

  const address = privyUser.wallet.address.toLowerCase();

  const existingCode = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
  if (!existingCode) {
    return { error: ERRORS.INVALID_INVITE_CODE };
  }

  if (existingCode.used >= existingCode.maxUses) {
    return { error: ERRORS.CODE_ALREADY_USED };
  }

  const newUser = await prisma.$transaction(async tx => {
    const newUser = await tx.user.upsert({
      where: { wallet: address },
      create: {
        privyUserId: privyUser.id,
        wallet: address,
        isActive: true
      },
      update: {
        privyUserId: privyUser.id,
        isActive: true
      }
    });

    const tryGenerateUniqueCode = async (): Promise<string> => {
      const code = "bf-" + generateRandomString(8);
      const existing = await tx.inviteCode.findUnique({ where: { code } });
      if (existing) {
        return await tryGenerateUniqueCode();
      }
      return code;
    };

    //Generate 3 invite codes
    await Promise.all(
      [0, 0, 0].map(async () => {
        const code = await tryGenerateUniqueCode();

        return await tx.inviteCode.create({
          data: {
            code: code,
            userId: newUser.id,
            used: 0,
            maxUses: 1
          }
        });
      })
    );

    await tx.inviteCode.update({
      where: { id: existingCode.id },
      data: {
        used: existingCode.used + 1
      }
    });

    return newUser;
  });

  try {
    await updateUserSocialProfiles(newUser);
  } catch (err) {
    console.error("Error while updating social profiles: ", err);
  }

  return { data: newUser };
};

export const updateUserSocialProfiles = async (user: User) => {
  const ensProfile = await getEnsProfile(user.wallet as `0x${string}`);
  const talentProtocolProfile = await axios
    .get<GetTalentResponse>(`${process.env.TALENT_PROTOCOL_API_BASE_URL}/talents/${user.wallet}`)
    .then(res => res.data)
    .catch(() => undefined);
  const airstackData = await getAirstackSocialData(user.wallet);
  const lensProfile = airstackData.socials?.find(social => social.dappName === "lens");
  const farcasterProfile = airstackData.socials?.find(social => social.dappName === "farcaster");

  if (ensProfile.name) {
    await prisma.socialProfile.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: SocialProfileType.ENS
        }
      },
      update: {
        profileName: ensProfile.name,
        profileImage: ensProfile.avatar
      },
      create: {
        profileName: ensProfile.name,
        profileImage: ensProfile.avatar,
        type: SocialProfileType.ENS,
        userId: user.id
      }
    });
  }

  if (talentProtocolProfile) {
    let url = "";
    try {
      const imageUrl = new URL(talentProtocolProfile.talent.profile_picture_url);
      url = imageUrl.origin + imageUrl.pathname;
    } catch {
      // ignore, leave empty
    }

    await prisma.socialProfile.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: SocialProfileType.TALENT_PROTOCOL
        }
      },
      update: {
        profileName: talentProtocolProfile.talent.name,
        profileImage: url
      },
      create: {
        profileName: talentProtocolProfile.talent.name,
        profileImage: url,
        type: SocialProfileType.TALENT_PROTOCOL,
        userId: user.id
      }
    });
  }

  if (lensProfile) {
    await prisma.socialProfile.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: SocialProfileType.LENS
        }
      },
      update: {
        profileName: lensProfile.profileName,
        profileImage: lensProfile.profileImage
      },
      create: {
        profileName: lensProfile.profileName,
        profileImage: lensProfile.profileImage,
        type: SocialProfileType.LENS,
        userId: user.id
      }
    });
  }

  if (farcasterProfile) {
    await prisma.socialProfile.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: SocialProfileType.FARCASTER
        }
      },
      update: {
        profileName: farcasterProfile.profileName,
        profileImage: farcasterProfile.profileImage
      },
      create: {
        profileName: farcasterProfile.profileName,
        profileImage: farcasterProfile.profileImage,
        type: SocialProfileType.FARCASTER,
        userId: user.id
      }
    });
  }

  const defaultAvatar =
    talentProtocolProfile?.talent.profile_picture_url ||
    farcasterProfile?.profileImage ||
    lensProfile?.profileImage ||
    ensProfile.avatar;
  const defaultName =
    talentProtocolProfile?.talent.name || farcasterProfile?.profileName || lensProfile?.profileName || ensProfile.name;

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      avatarUrl: defaultAvatar,
      displayName: defaultName
    },
    include: {
      socialProfiles: true
    }
  });
};
