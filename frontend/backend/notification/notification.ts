"use server";

import { PAGINATION_LIMIT } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { NotificationType, Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

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
    skip: offset,
    orderBy: {
      createdAt: "desc"
    }
  });

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

export const getNotificationSettings = async (privyUserId: string) => {
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  const settings = await prisma.userNotificationSetting.findMany({
    where: {
      userId: currentUser.id
    }
  });

  return { data: settings };
};

export const updateNotificationSettings = async (privyUserId: string, settings: Record<NotificationType, boolean>) => {
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: {
      privyUserId: privyUserId
    }
  });

  //Prisma doesn't have upsertMany function. Best way is to deleteMany and createMany
  const updatedSettings = prisma.$transaction(async tx => {
    await tx.userNotificationSetting.deleteMany({
      where: {
        userId: currentUser.id,
        notificationType: {
          in: Object.keys(settings) as NotificationType[]
        }
      }
    });
    const added = await tx.userNotificationSetting.createMany({
      data: Object.keys(settings).map(key => ({
        userId: currentUser.id,
        notificationType: key as NotificationType,
        isDisabled: settings[key as NotificationType]
      }))
    });

    return added;
  });

  return { data: updatedSettings };
};

export const sendNotification = async (
  targetUserId: number,
  sourceUserId: number,
  type: NotificationType,
  referenceId?: number,
  tx?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
) => {
  //If tx is passed, use it. Otherwise, use the default prisma client
  const prismaClient = tx ?? prisma;

  const notification = await prismaClient.notification.create({
    data: {
      targetUserId: targetUserId,
      sourceUserId: sourceUserId,
      type: type,
      referenceId: referenceId
    }
  });

  return { data: notification.id };
};
