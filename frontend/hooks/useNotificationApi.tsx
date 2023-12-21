import { getNotifications } from "@/backend/notification/notification";
import {
  getNotificationSettingsSA,
  markNotificationsAsReadSA,
  updateNotificationSettingsSA
} from "@/backend/notification/notificationServerActions";
import { NotificationType } from "@prisma/client";
import { useInfiniteQueryAxios } from "./useInfiniteQueryAxios";
import { useMutationSA } from "./useMutationSA";
import { useQuerySA } from "./useQuerySA";

export const useGetNotifications = () => {
  return useInfiniteQueryAxios<Awaited<ReturnType<typeof getNotifications>>>(
    ["useGetNotifications"],
    "/api/notification/me"
  );
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
