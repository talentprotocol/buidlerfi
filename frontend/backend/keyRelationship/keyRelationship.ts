"use server";

import prisma from "@/lib/prisma";

export const getKeyRelationships = async (address: string, side: "owner" | "holder") => {
  const relationships = await prisma.keyRelationship.findMany({
    where:
      side === "owner"
        ? {
            owner: {
              wallet: address.toLowerCase()
            },
            amount: {
              gt: 0
            }
          }
        : {
            holder: {
              wallet: address.toLowerCase()
            },
            amount: {
              gt: 0
            }
          },
    include: {
      holder: {
        select: {
          socialProfiles: {
            where: {
              type: "FARCASTER"
            }
          },
          wallet: true,
          avatarUrl: true,
          displayName: true,
          id: true,
          bio: true,
          isActive: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          privyUserId: true,
          socialWallet: true,
          hasFinishedOnboarding: true,
          invitedById: true,
          lastRecommendationsSyncedAt: true,
          _count: {
            select: {
              keysOfSelf: {
                where: {
                  amount: {
                    gt: 0
                  }
                }
              },
              replies: {
                where: {
                  repliedOn: {
                    not: null
                  }
                }
              }
            }
          }
        }
      },
      owner: {
        select: {
          socialProfiles: {
            where: {
              type: "FARCASTER"
            }
          },
          wallet: true,
          avatarUrl: true,
          displayName: true,
          id: true,
          bio: true,
          isActive: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          privyUserId: true,
          socialWallet: true,
          hasFinishedOnboarding: true,
          invitedById: true,
          lastRecommendationsSyncedAt: true,
          _count: {
            select: {
              keysOfSelf: {
                where: {
                  amount: {
                    gt: 0
                  }
                }
              },
              replies: {
                where: {
                  repliedOn: {
                    not: null
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      amount: "desc"
    }
  });

  return { data: relationships };
};

//Can pass either userId, privyUserId or wallet for user
export const ownsKey = async (
  ownerUser: { userId?: number; privyUserId?: string; wallet?: string },
  holderUser: { userId?: number; privyUserId?: string; wallet?: string }
) => {
  if (
    (!holderUser.privyUserId && !holderUser.userId && !holderUser.wallet) ||
    (!ownerUser.privyUserId && !ownerUser.userId && !ownerUser.wallet)
  )
    return false;

  const key = await prisma.keyRelationship.findFirst({
    where: {
      owner: {
        id: ownerUser.userId,
        privyUserId: ownerUser.privyUserId,
        wallet: ownerUser.wallet?.toLowerCase()
      },
      holder: {
        id: holderUser.userId,
        privyUserId: holderUser.privyUserId,
        wallet: holderUser.wallet?.toLowerCase()
      },
      amount: {
        gt: 0
      }
    }
  });

  return !!key;
};

export const hasLaunchedKeys = async (user: { userId?: number; privyUserId?: string; wallet?: string }) => {
  const key = await prisma.keyRelationship.findFirst({
    where: {
      owner: {
        id: user.userId,
        privyUserId: user.privyUserId,
        wallet: user.wallet?.toLowerCase()
      },
      holder: {
        id: user.userId,
        privyUserId: user.privyUserId,
        wallet: user.wallet?.toLowerCase()
      },
      amount: {
        gt: 0
      }
    }
  });

  return !!key;
};
