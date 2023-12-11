import {
  getNotificationSettingsSA,
  getNotificationsSA,
  markNotificationsAsReadSA,
  updateNotificationSettingsSA
} from "@/backend/notification/notificationServerActions";
import { NotificationType } from "@prisma/client";
import { useInfiniteQuerySA } from "./useInfiniteQuerySA";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export const useGetNotifications = () => {
  return useInfiniteQuerySA(["useGetNotifications"], async options => getNotificationsSA(options));
};

export const useMarkNotificationsAsRead = () => {
  return useMutationSA(async (options, notificationIds: number[]) =>
    markNotificationsAsReadSA(notificationIds, options)
  );
};

export const useGetNotificationSettings = () => {
  return useQuerySA(["useGetNotificationSettings"], async options => getNotificationSettingsSA(options));
};

export const useUpdateNotificationSettings = () => {
  return useMutationSA(async (options, settings: Record<NotificationType, boolean>) =>
    updateNotificationSettingsSA(settings, options)
  );
};
