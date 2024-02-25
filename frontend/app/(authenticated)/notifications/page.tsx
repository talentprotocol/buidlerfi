"use client";

import { NotificationEntry } from "@/components/app/notification/notificationEntry";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { BackButton, InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useMarkNotificationsAsRead } from "@/hooks/useNotificationApi";
import { sortIntoPeriods } from "@/lib/utils";
import Notifications from "@mui/icons-material/Notifications";
import Typography from "@mui/joy/Typography";
import { useEffect, useMemo } from "react";

const periods = ["today", "last 7 days", "last 30 days", "last year", "all time"] as const;
export type period = (typeof periods)[number];

export default function NotificationPage() {
  const { notifications, refetchNotifications } = useUserContext();
  // const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);

  const sorted = useMemo(() => sortIntoPeriods(notifications || []), [notifications]);

  const markAsRead = useMarkNotificationsAsRead();

  //Refetch when opening page
  useEffect(() => {
    (async () => {
      await refetchNotifications();

      const unreadNotifs = notifications?.filter(notif => !notif.isRead) || [];
      if (unreadNotifs.length > 0) {
        markAsRead.mutateAsync(unreadNotifs.map(notif => notif.id)).then(() => refetchNotifications());
      }
    })();
  }, []);

  return (
    <Flex component={"main"} y grow>
      {/* {isNotifSettingsOpen && <NotificationSettingsModal close={() => setIsNotifSettingsOpen(false)} />} */}
      <InjectTopBar
        title="notifications"
        startItem={<BackButton />}
        // endItem={
        //   <IconButton onClick={() => setIsNotifSettingsOpen(true)}>
        //     <SettingsOutlined />
        //   </IconButton>
        // }
      />
      {notifications?.length === 0 ? (
        <PageMessage icon={<Notifications />} title="No notifications" text="Your notifications will appear here" />
      ) : (
        Object.keys(sorted)
          .filter(key => sorted[key as keyof typeof sorted].length > 0)
          .map(key => {
            return (
              <Flex y key={key}>
                <Typography level="body-sm" fontWeight={600} sx={{ px: 2, pt: 2 }}>
                  {key}
                </Typography>
                {sorted[key as keyof typeof sorted]?.map(notification => {
                  return <NotificationEntry key={notification.id} notification={notification} />;
                })}
              </Flex>
            );
          })
      )}
    </Flex>
  );
}
