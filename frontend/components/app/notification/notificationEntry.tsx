import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetNotifications, useMarkNotificationsAsRead } from "@/hooks/useNotificationApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { getDifference, shortAddress } from "@/lib/utils";
import Avatar from "@mui/joy/Avatar";
import Badge from "@mui/joy/Badge";
import Typography from "@mui/joy/Typography";
import { NotificationType } from "@prisma/client";
import { FC } from "react";

export type BuilderfiNotification = NonNullable<ReturnType<typeof useGetNotifications>["data"]>[number];

const NotificationContent = {
  [NotificationType.ASKED_QUESTION]: "asked you a question",
  [NotificationType.REPLIED_YOUR_QUESTION]: "answered your question",
  [NotificationType.USER_INVITED]: "joined builder.fi with your invite",
  [NotificationType.QUESTION_UPVOTED]: "upvoted your question",
  [NotificationType.QUESTION_DOWNVOTED]: "downvoted your question",
  [NotificationType.REPLY_REACTION]: "liked your answer",
  [NotificationType.FRIEND_JOINED]: "joined builder.fi",
  [NotificationType.KEYBUY]: "bought your key",
  [NotificationType.LIKE_YOUR_COMMENT]: "liked your comment",
  [NotificationType.COMMENT]: "commented on your question",
  [NotificationType.KEYSELL]: "sold your key",
  [NotificationType.REPLIED_OTHER_QUESTION]: "answered a question you follow",
  [NotificationType.NEW_OPEN_QUESTION]: "asked a question that might interest you",
  //In this case we return the description of the notification from the DB.
  [NotificationType.SYSTEM]: (notification: BuilderfiNotification) => notification.description,
  [NotificationType.POINTS_DROP]: "you received new points",
  [NotificationType.NEW_INVITE_CODE]: "you received a new invite code"
} as const;

const GetNotificationPath = (notification: BuilderfiNotification) => {
  switch (notification.type) {
    case NotificationType.ASKED_QUESTION:
    case NotificationType.REPLIED_YOUR_QUESTION:
    case NotificationType.QUESTION_UPVOTED:
    case NotificationType.QUESTION_DOWNVOTED:
    case NotificationType.REPLY_REACTION:
    case NotificationType.NEW_OPEN_QUESTION:
      return `/question/${notification.referenceId}`;
    case NotificationType.USER_INVITED:
    case NotificationType.FRIEND_JOINED:
    case NotificationType.KEYBUY:
    case NotificationType.KEYSELL:
      return `/profile/${notification.sourceUser?.wallet}`;
    case NotificationType.POINTS_DROP:
    case NotificationType.NEW_INVITE_CODE:
      return `/invite`;
    case NotificationType.LIKE_YOUR_COMMENT:
      return `/question/${notification.referenceId}`;
    case NotificationType.COMMENT:
      return `/question/${notification.referenceId}`;
    //Not used yet
    case NotificationType.REPLIED_OTHER_QUESTION:
    case NotificationType.SYSTEM:
    default:
      return "/home";
  }
};

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

    const url = GetNotificationPath(notification);
    router.push(url);
  };

  return (
    <Flex x yc xsb p={2} pointer hover onClick={handleNotificationClick}>
      <Flex x xs yc gap1>
        <Badge badgeInset="14%" size="sm" invisible={notification.isRead}>
          <Avatar src={notification.sourceUser ? notification.sourceUser.avatarUrl || undefined : LOGO_BLUE_BACK} />
        </Badge>
        <Flex y>
          <Typography fontWeight={notification.isRead ? 400 : 600} level="title-sm">
            {notification.sourceUser
              ? notification.sourceUser.displayName || shortAddress(notification.sourceUser.wallet)
              : "Someone just"}
          </Typography>
          <Typography level="body-sm">{content}</Typography>
        </Flex>
      </Flex>
      <Typography level="body-sm">{dateDiff}</Typography>
    </Flex>
  );
};
