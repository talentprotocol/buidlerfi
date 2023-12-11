"use server";

import { PAGINATION_LIMIT } from "@/lib/constants";
import prisma from "@/lib/prisma";

export const getNotifications = async (privyUserId: string, offset: number) => {
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  const notifications = await prisma.notification.findMany({
    where: {
      targetUserId: currentUser.id
    },
    include: {
      sourceUser: true,
      targetUser: true
    },
    take: PAGINATION_LIMIT,
    skip: offset
  });

  console.log(notifications);

  return { data: notifications };
};

export const markNotificationsAsRead = async (privyUserId: string, notificationIds: number[]) => {
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  const entries = await prisma.notification.updateMany({
    where: {
      id: {
        in: notificationIds
      },
      targetUserId: currentUser.id
    },
    data: {
      isRead: true
    }
  });

  return { data: entries };
};
