"use client";

import { BuilderfiNotification, NotificationEntry } from "@/components/app/notification/notificationEntry";
import { NotificationSettingsModal } from "@/components/app/notification/notificationSettingsModal";
import { Flex } from "@/components/shared/flex";
import { BackButton, InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { SettingsOutlined } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/joy";
import { startOfDay, subDays, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";

const periods = ["today", "last 7 days", "last 30 days", "last year", "all time"] as const;
export type period = (typeof periods)[number];

const sortIntoPeriods = (notifications: BuilderfiNotification[]) => {
  const now = new Date();
  const today = startOfDay(now);
  const lastWeek = subDays(now, 7);
  const lastMonth = subMonths(now, 1);
  const lastYear = subMonths(now, 12);

  const sorted = {
    today: [] as BuilderfiNotification[],
    "last 7 days": [] as BuilderfiNotification[],
    "last 30 days": [] as BuilderfiNotification[],
    "last year": [] as BuilderfiNotification[],
    "all time": [] as BuilderfiNotification[]
  };

  notifications.forEach(notification => {
    if (notification.createdAt > today) sorted["today"].push(notification);
    else if (notification.createdAt > lastWeek) sorted["last 7 days"].push(notification);
    else if (notification.createdAt > lastMonth) sorted["last 30 days"].push(notification);
    else if (notification.createdAt > lastYear) sorted["last year"].push(notification);
    else sorted["all time"].push(notification);
  });

  return sorted;
};

export default function NotificationPage() {
  const { notifications, refetchNotifications } = useUserContext();
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);

  const sorted = useMemo(() => sortIntoPeriods(notifications || []), [notifications]);

  useEffect(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  return (
    <Flex component={"main"} y grow>
      {isNotifSettingsOpen && <NotificationSettingsModal close={() => setIsNotifSettingsOpen(false)} />}
      <InjectTopBar
        title="notifications"
        startItem={<BackButton />}
        endItem={
          <IconButton onClick={() => setIsNotifSettingsOpen(true)}>
            <SettingsOutlined />
          </IconButton>
        }
      />
      {Object.keys(sorted)
        .filter(key => sorted[key as keyof typeof sorted].length > 0)
        .map(key => {
          return (
            <Flex y key={key}>
              <Typography sx={{ px: 2, pt: 2 }}>{key}</Typography>
              {sorted[key as keyof typeof sorted]?.map(notification => {
                return <NotificationEntry key={notification.id} notification={notification} />;
              })}
            </Flex>
          );
        })}
    </Flex>
  );
}
