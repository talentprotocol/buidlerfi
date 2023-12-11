"use server";

import { ServerActionOptions, serverActionWrapper } from "@/lib/serverActionWrapper";
import { getNotifications, markNotificationsAsRead } from "./notification";

export const getNotificationsSA = async (options: ServerActionOptions) => {
  return serverActionWrapper(data => getNotifications(data.privyUserId, options.pagination?.offset || 0), options);
};

export const markNotificationsAsReadSA = async (notificationIds: number[], options: ServerActionOptions) => {
  return serverActionWrapper(data => markNotificationsAsRead(data.privyUserId, notificationIds), options);
};
