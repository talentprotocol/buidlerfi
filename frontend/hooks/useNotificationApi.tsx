import { getNotificationsSA, markNotificationsAsReadSA } from "@/backend/notification/notificationServerActions";
import { useInfiniteQuerySA } from "./useInfiniteQuerySA";
import { useMutationSA } from "./useMutationSA";

export const useGetNotifications = () => {
  return useInfiniteQuerySA(["useGetNotifications"], async options => getNotificationsSA(options));
};

export const useMarkNotificationsAsRead = () => {
  return useMutationSA(async (options, notificationIds: number[]) =>
    markNotificationsAsReadSA(notificationIds, options)
  );
};
