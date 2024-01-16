"use server";

import { QUESTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import viemClient from "@/lib/viemClient";

export const getAllQuest = async () => {
  const res = await prisma.quest.findMany({
    where: {
      isActive: true
    }
  });
  return { data: res };
};

export const getUserQuest = async (privyUserId: string) => {
  const res = await prisma.userQuest.findMany({
    where: {
      user: {
        privyUserId
      }
    }
  });
  return { data: res };
};

const hasLaunchedKey = async (userId: number) => {
  return !!(await prisma.keyRelationship.findFirst({
    where: {
      holderId: userId,
      ownerId: userId,
      amount: {
        gt: 0
      }
    }
  }));
};

const hasLinkedSocials = async (userId: number) => {
  return !!(await prisma.socialProfile.findFirst({
    where: {
      userId
    }
  }));
};

const hasDepositedEth = async (userWallet: string) => {
  const balance = await viemClient.getBalance({ address: userWallet as `0x${string}` });
  return balance >= BigInt(1e17);
};

const hasAskedQuestion = async (userId: number) => {
  //Find question excluding questions asked to themselves
  //Questions cannot be asked without a key. So we don't need to verify key ownership
  const askedQuestions = await prisma.question.findFirst({
    where: {
      questionerId: userId,
      replierId: {
        not: userId
      }
    }
  });
  return !!askedQuestions;
};

export const verifyAllQuests = async (privyUserId: string) => {
  const currentUser = await prisma.user.findUniqueOrThrow({ where: { privyUserId } });
  const quests = await prisma.quest.findMany({ where: { isActive: true } });
  const completedQuests = await prisma.userQuest.findMany({
    where: {
      user: {
        privyUserId
      },
      completedAt: {
        not: null
      }
    }
  });

  const incompleteQuests = quests.filter(
    quest => !completedQuests.find(completedQuest => completedQuest.questId === quest.id)
  );

  const newCompletedQuests: number[] = [];

  for (const quest of incompleteQuests) {
    //Install APP and turn on notification
    //Not sure how to verify this
    //Will disable in DB for now
    if (quest.description === QUESTS[0].description) {
    }
    //Link web3 socials
    else if (quest.description === QUESTS[1].description && (await hasLinkedSocials(currentUser.id))) {
      newCompletedQuests.push(quest.id);
    }
    //create your key
    else if (quest.description === QUESTS[2].description && (await hasLaunchedKey(currentUser.id))) {
      newCompletedQuests.push(quest.id);
    }
    //deposit >0.01 eth
    else if (quest.description === QUESTS[3].description && (await hasDepositedEth(currentUser.wallet))) {
      newCompletedQuests.push(quest.id);
    }
    //buy 1 key and ask 1 question
    else if (quest.description === QUESTS[4].description && (await hasAskedQuestion(currentUser.id))) {
      newCompletedQuests.push(quest.id);
    }
  }

  const res = await prisma.userQuest.createMany({
    data: newCompletedQuests.map(questId => ({ questId, userId: currentUser.id, completedAt: new Date() }))
  });

  return { data: res };
};
