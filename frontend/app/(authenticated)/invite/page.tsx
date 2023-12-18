"use client";

import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetInvitedUsers } from "@/hooks/useInviteCodeApi";
import { useGetCurrentPosition } from "@/hooks/usePointApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";

import { shortAddress } from "@/lib/utils";
import { Close, ContentCopy } from "@mui/icons-material";
import { Avatar, Card, DialogTitle, Divider, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

export default function Invite() {
  const { user } = useUserContext();
  const { data: invitedUsers } = useGetInvitedUsers();
  const { data: currentPosition } = useGetCurrentPosition();
  const [showInvitedUsersModal, setShowInvitedUsersModal] = useState(false);
  const router = useBetterRouter();

  const points = useMemo(() => user?.points?.reduce((prev, curr) => prev + curr.points, 0), [user?.points]);
  const invitedCount = user?.inviteCodes.reduce((prev, curr) => prev + curr.used, 0);

  const position = useMemo(() => {
    if (!currentPosition) {
      return "Unknown";
    } else if (currentPosition.length > 0) {
      return currentPosition[0].position.toString();
    } else {
      return "Unknown";
    }
  }, [currentPosition]);

  const showInvitedUsers = () => {
    if (!invitedUsers) {
      return;
    }

    if (invitedUsers.length > 0) {
      setShowInvitedUsersModal(true);
    }
  };

  const closeInvitedUsers = () => {
    setShowInvitedUsersModal(false);
  };

  return (
    <Flex y p={2}>
      <InjectTopBar title="Points" withBack />
      <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
        Invite builders. <br /> Earn points.
      </Typography>
      <Typography level="body-sm" mt={1}>
        Points are airdropped every Friday and will have future uses in builder.fi. Earn points by asking and answering
        questions, depositing funds, trading keys or inviting friends.
      </Typography>
      <Flex x gap2 py={2}>
        <Card sx={{ flexGrow: 1, gap: 0 }} variant="soft">
          <Typography fontWeight={600} level="h4">
            {points}
          </Typography>
          <Typography>Your points</Typography>
        </Card>
        <Card
          sx={{ flexGrow: 1, gap: 0, border: 0, cursor: "pointer" }}
          variant="soft"
          component={"button"}
          onClick={() => showInvitedUsers()}
        >
          <Typography fontWeight={600} level="h4">
            {invitedCount}
          </Typography>
          <Typography>Builders invited</Typography>
        </Card>
      </Flex>
      <Flex y xs py={2}>
        <Typography level="body-sm">Your unique invite codes</Typography>
        <Flex y gap1>
          {user?.inviteCodes.length === 0 ? (
            <Typography level="h4">Coming soon</Typography>
          ) : (
            user?.inviteCodes.map(code => (
              <Flex x yc key={code.code} gap1>
                <Typography level="h4" sx={{ textDecoration: code.used >= code.maxUses ? "line-through" : undefined }}>
                  {code.code}
                </Typography>
                <IconButton
                  size="sm"
                  onClick={() => {
                    window.navigator.clipboard.writeText(window.location.origin + "?inviteCode=" + code.code);
                    toast.success("Copied invite link to clipboard");
                  }}
                >
                  <ContentCopy sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              </Flex>
            ))
          )}
        </Flex>
      </Flex>
      <Divider />
      <Flex y xs py={2} gap2>
        <Typography level="h4">Leaderboard</Typography>
        {position !== "Unkown" ? (
          <Flex x yc gap1>
            <Avatar size="sm">{position}</Avatar>
            <Avatar
              size="sm"
              src={user?.avatarUrl || DEFAULT_PROFILE_PICTURE}
              alt={user?.displayName || "profile picture"}
            />
            <Typography textColor={"neutral.800"} fontWeight={600} level="title-sm">
              {user?.displayName || user?.wallet}
            </Typography>
          </Flex>
        ) : (
          <Typography textColor={"neutral.600"} level="title-sm">
            Earn points to claim your spot in the builder.fi leaderboard!
          </Typography>
        )}
      </Flex>
      <Modal open={showInvitedUsersModal} onClose={closeInvitedUsers}>
        <ModalDialog minWidth="400px">
          <Flex x xsb yc>
            <DialogTitle>Invited builders</DialogTitle>
            <IconButton onClick={closeInvitedUsers}>
              <Close />
            </IconButton>
          </Flex>
          <Flex y gap2>
            {invitedUsers &&
              invitedUsers.map((u, index) => (
                <Flex x yc gap1 key={`invited-user-list-${u?.wallet}`}>
                  <Avatar size="sm">{index + 1}</Avatar>
                  <Avatar
                    size="sm"
                    src={u?.avatarUrl || DEFAULT_PROFILE_PICTURE}
                    alt={u?.displayName || "profile picture"}
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`/profile/${u?.wallet}`)}
                  />
                  <Typography
                    textColor={"neutral.800"}
                    fontWeight={600}
                    level="title-sm"
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`/profile/${u?.wallet}`)}
                  >
                    {u?.displayName || shortAddress(u?.wallet || "")}
                  </Typography>
                </Flex>
              ))}
          </Flex>
        </ModalDialog>
      </Modal>
    </Flex>
  );
}
