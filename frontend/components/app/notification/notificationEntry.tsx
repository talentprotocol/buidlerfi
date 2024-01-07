import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetNotifications, useMarkNotificationsAsRead } from "@/hooks/useNotificationApi";
import { getDifference, shortAddress } from "@/lib/utils";
import { Avatar, Badge, Typography } from "@mui/joy";
import { NotificationType } from "@prisma/client";
import { FC } from "react";

export type BuilderfiNotification = NonNullable<ReturnType<typeof useGetNotifications>["data"]>[number];

const NotificationContent = {
  [NotificationType.ASKED_QUESTION]: "asked you a question",
  [NotificationType.REPLIED_YOUR_QUESTION]: "answered your question",
  [NotificationType.USER_INVITED]: "joined builder.fi with your invite",
  [NotificationType.QUESTION_UPVOTED]: "upvoted your question",
  [NotificationType.QUESTION_DOWNVOTED]: "downvoted your question",
  [NotificationType.REPLY_REACTION]: "liked your reply",
  [NotificationType.FRIEND_JOINED]: "joined builder.fi",
  [NotificationType.KEYBUY]: "bought your key",
  [NotificationType.KEYSELL]: "sold your key",
  [NotificationType.REPLIED_OTHER_QUESTION]: "answered a question you follow",
  //In this case we return the description of the notification from the DB.
  [NotificationType.SYSTEM]: (notification: BuilderfiNotification) => notification.description,
  [NotificationType.POINTS_DROP]: "you received new points",
  [NotificationType.NEW_INVITE_CODE]: "you received a new invite code"
} as const;

const NotificationClick = {
  [NotificationType.ASKED_QUESTION]: (notification: BuilderfiNotification) =>
    `/profile/${notification.targetUser.wallet}?question=${notification.referenceId}`,
  [NotificationType.REPLIED_YOUR_QUESTION]: (notification: BuilderfiNotification) =>
    `/profile/${notification.sourceUser?.wallet}?question=${notification.referenceId}`,
  [NotificationType.USER_INVITED]: (notification: BuilderfiNotification) =>
    `/profile/${notification.sourceUser?.wallet}`,
  [NotificationType.QUESTION_UPVOTED]: (notification: BuilderfiNotification) => `/question/${notification.referenceId}`,
  [NotificationType.QUESTION_DOWNVOTED]: (notification: BuilderfiNotification) =>
    `/question/${notification.referenceId}`,
  [NotificationType.REPLY_REACTION]: (notification: BuilderfiNotification) => `/question/${notification.referenceId}`,
  [NotificationType.FRIEND_JOINED]: (notification: BuilderfiNotification) =>
    `/profile/${notification.sourceUser?.wallet}`,
  [NotificationType.KEYBUY]: (notification: BuilderfiNotification) => `/profile/${notification.sourceUser?.wallet}`,
  [NotificationType.KEYSELL]: (notification: BuilderfiNotification) => `/profile/${notification.sourceUser?.wallet}`,
  [NotificationType.POINTS_DROP]: () => `/invite`,
  [NotificationType.NEW_INVITE_CODE]: () => `/invite`,
  //TODO
  [NotificationType.REPLIED_OTHER_QUESTION]: () => "",
  [NotificationType.SYSTEM]: () => ""
} as const;

interface Props {
  notification: BuilderfiNotification;
}

export const NotificationEntry: FC<Props> = ({ notification }) => {
  const router = useBetterRouter();
  const { refetchNotifications } = useUserContext();
  const markAsRead = useMarkNotificationsAsRead();
  const dateDiff = getDifference(notification.createdAt);
  const content =
    notification.type === NotificationType.SYSTEM
      ? NotificationContent[notification.type](notification)
      : NotificationContent[notification.type];

  const handleNotificationClick = async () => {
    if (!notification.isRead) await markAsRead.mutateAsync([notification.id]);
    refetchNotifications();

    const url = NotificationClick[notification.type](notification);
    router.push(url);
  };

  return (
    <Flex x yc xsb p={2} pointer hover onClick={handleNotificationClick}>
      <Flex x xs yc gap1>
        <Badge invisible={notification.isRead}>
          <Avatar src={notification.sourceUser?.avatarUrl || undefined} />
        </Badge>
        <Flex y>
          {notification.sourceUser && (
            <Typography fontWeight={notification.isRead ? 400 : 600} level="title-sm">
              {notification.sourceUser.displayName || shortAddress(notification.sourceUser.wallet)}
            </Typography>
          )}
          <Typography level="body-sm">{content}</Typography>
        </Flex>
      </Flex>
      <Typography level="body-sm">{dateDiff}</Typography>
    </Flex>
  );
};
