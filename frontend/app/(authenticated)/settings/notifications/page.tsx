"use client";

import { Flex } from "@/components/shared/flex";
import { BackButton, InjectTopBar } from "@/components/shared/top-bar";
import { useGetNotificationSettings, useUpdateNotificationSettings } from "@/hooks/useNotificationApi";
import Switch from "@mui/joy/Switch";
import Typography from "@mui/joy/Typography";
import { NotificationType } from "@prisma/client";
import { useMemo } from "react";

type SettingLabel = {
  [key: string]: { type: NotificationType; text: string };
};

const NotificationTypeToLabel: SettingLabel = {
  direct: {
    type: NotificationType.ASKED_QUESTION,
    text: "@bldr asked/answered your question"
  },
  reactions: {
    type: NotificationType.QUESTION_UPVOTED,
    text: "@bldr upvoted/downvoted your question"
  },
  "Your Keys": {
    type: NotificationType.KEYBUY,
    text: "@bldr bought/sold your key"
  },
  holding: {
    type: NotificationType.REPLIED_OTHER_QUESTION,
    text: "@bldr answered a question you follow"
  },
  invites: {
    type: NotificationType.USER_INVITED,
    text: "@bldr joined builder.fi with your invite"
  },
  friends: {
    type: NotificationType.FRIEND_JOINED,
    text: "@bldr, your friend on Farcaster, just joined builder.fi"
  },
  point: {
    type: NotificationType.POINTS_DROP,
    text: "You received X points this week"
  }
} as const;
export default function NotificationSettingsPage() {
  const { data: notificationSettings, refetch } = useGetNotificationSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();

  const notificationSettingsDict = useMemo(() => {
    if (!notificationSettings) return {} as Record<NotificationType, boolean>;

    return notificationSettings.reduce((acc, curr) => {
      acc[curr.notificationType] = !curr.isDisabled;
      return acc;
    }, {} as Record<NotificationType, boolean>);
  }, [notificationSettings]);

  return (
    <Flex component={"main"} y grow gap1>
      <InjectTopBar title="notifications" startItem={<BackButton />} />
      <Flex x xsb mt={2} mx={2} p={1.5} style={{ borderRadius: "10px", backgroundColor: "#F0F4F8" }}>
        <Flex y>
          <Typography level="title-sm" fontWeight={"600"}>
            enable push notifications
          </Typography>
        </Flex>
        <Switch />
      </Flex>
      <Typography level="title-sm" textColor={"neutral.600"} px={2}>
        push notifications
      </Typography>
      <Flex y mx={2} style={{ borderRadius: "10px", backgroundColor: "#F0F4F8" }}>
        {Object.keys(NotificationTypeToLabel).map(key => {
          return (
            <Flex
              x
              xsb
              key={key}
              p={1.5}
              sx={{ borderBottom: "1px solid #CDD7E1", ":last-of-type": { border: "none" } }}
            >
              <Flex y>
                <Typography level="title-sm" fontWeight={"600"}>
                  {key}
                </Typography>
                <Typography level="body-sm">{NotificationTypeToLabel[key].text}</Typography>
              </Flex>
              <Switch
                onChange={e =>
                  updateNotificationSettings
                    .mutateAsync({
                      [NotificationTypeToLabel[key].type as NotificationType]: !e.target.checked
                    } as Record<NotificationType, boolean>)
                    .then(() => refetch())
                }
                checked={
                  NotificationTypeToLabel[key].type in notificationSettingsDict
                    ? notificationSettingsDict[NotificationTypeToLabel[key].type as NotificationType]
                    : true
                }
              />
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
