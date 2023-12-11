"use server";

import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { NotificationType } from "@prisma/client";
import {
  getNotificationSettings,
  getNotifications,
  markNotificationsAsRead,
  updateNotificationSettings
} from "./notification";

export const getNotificationsSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => getNotifications(data.privyUserId, options.pagination?.offset || 0), options);
};

export const markNotificationsAsReadSA = async (notificationIds: number[], options: ServerActionOptions) => {
  return serverActionWrapper(data => markNotificationsAsRead(data.privyUserId, notificationIds), options);
};

export const getNotificationSettingsSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => getNotificationSettings(data.privyUserId), options);
};

export const updateNotificationSettingsSA = async (
  settings: Record<NotificationType, boolean>,
  options: ServerActionOptions
) => {
  return serverActionWrapper(data => updateNotificationSettings(data.privyUserId, settings), options);
};
