import { Flex } from "@/components/shared/flex";
import { useGetNotificationSettings, useUpdateNotificationSettings } from "@/hooks/useNotificationApi";
import { Modal, ModalClose, ModalDialog, Switch, Typography } from "@mui/joy";
import { NotificationType } from "@prisma/client";
import { FC, useMemo } from "react";

interface Props {
  close: () => void;
}

const NotificationTypeToLabel = {
  [NotificationType.ASKED_QUESTION]: "Someone asks you a question",
  [NotificationType.REPLIED_YOUR_QUESTION]: "Someone answers your question",
  [NotificationType.USER_INVITED]: "Someone joins builder.fi with your invite",
  [NotificationType.QUESTION_UPVOTED]: "Someone upvotes your question",
  [NotificationType.QUESTION_DOWNVOTED]: "Someone downvotes your question",
  [NotificationType.REPLY_REACTION]: "Someone likes your reply",
  [NotificationType.FRIEND_JOINED]: "Your friend joins builder.fi",
  [NotificationType.KEYBUY]: "Someone buys your key",
  [NotificationType.KEYSELL]: "Someone sells your key",
  [NotificationType.REPLIED_OTHER_QUESTION]: "Someone answers a question you follow",
  [NotificationType.SYSTEM]: "System notification",
  [NotificationType.POINTS_DROP]: "You receive new points",
  [NotificationType.NEW_INVITE_CODE]: "You receive a new invite code"
} as const;

export const NotificationSettingsModal: FC<Props> = ({ close }) => {
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
    <Modal open={true} onClose={close}>
      <ModalDialog>
        <Flex y p={1} gap2>
          <Typography level="title-lg">Notification settings</Typography>
          <ModalClose />
          {Object.keys(NotificationType).map(key => {
            return (
              <Flex x xsb gap3 key={key} fullwidth>
                <Typography level="body-md">{NotificationTypeToLabel[key as NotificationType]}</Typography>
                <Switch
                  onChange={e =>
                    updateNotificationSettings
                      .mutateAsync({ [key as NotificationType]: !e.target.checked } as Record<
                        NotificationType,
                        boolean
                      >)
                      .then(() => refetch())
                  }
                  checked={key in notificationSettingsDict ? notificationSettingsDict[key as NotificationType] : true}
                />
              </Flex>
            );
          })}
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
