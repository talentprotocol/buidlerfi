"use client";
import { ParachuteIcon } from "@/components/icons/parachute";
import { Flex } from "@/components/shared/flex";
import { PointInfo } from "@/components/shared/point-info";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useClaimPoint, useGetCurrentPosition } from "@/hooks/usePointApi";
import { useGetQuest, useGetUserQuest, useVerifyQuests } from "@/hooks/useQuestAPI";
import { AIRDROP_EXPIRATION_AFTER_CREATION, GET_NEXT_AIRDROP_DATE } from "@/lib/constants";
import { getFullTimeDifference, shortAddress } from "@/lib/utils";
import { CheckCircle, ContentCopyOutlined, HelpOutline } from "@mui/icons-material";
import { Button, ButtonGroup, Card, Chip, IconButton, Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

export default function Invite() {
  const { user, refetch, isLoading } = useUserContext();
  const { data: currentPosition } = useGetCurrentPosition();
  const [showPointInfoModal, setShowPointInfoModal] = useState(false);
  const [showAllInvitesCode, setShowAllInvitesCode] = useState(false);
  const router = useBetterRouter();
  const points = useMemo(
    () => user?.points?.filter(point => point.claimed).reduce((prev, curr) => prev + curr.points, 0),
    [user?.points]
  );
  const unclaimedPoints = useMemo(() => {
    return (
      user?.points
        ?.filter(
          point => !point.claimed && differenceInDays(point.createdAt, new Date()) < AIRDROP_EXPIRATION_AFTER_CREATION
        )
        .reduce((prev, curr) => prev + curr.points, 0) || 0
    );
  }, [user?.points]);

  const invitations = useMemo(() => user?.inviteCodes.flatMap(inviteCode => inviteCode.invitations), [user]);
  const position = useMemo(() => {
    if (!currentPosition) {
      return "Unknown";
    } else if (currentPosition.length > 0) {
      return currentPosition[0].position.toString();
    } else {
      return "Unknown";
    }
  }, [currentPosition]);
  const closePointInfo = () => {
    setShowPointInfoModal(false);
  };
  const { data: quests } = useGetQuest();
  const { data: userQuests } = useGetUserQuest();

  const time = useMemo(() => getFullTimeDifference(GET_NEXT_AIRDROP_DATE()), []);

  const claimPoints = useClaimPoint();

  const verifyQuests = useVerifyQuests();

  const {} = useQuery(
    ["verifyQuests"],
    () => {
      verifyQuests.mutateAsync().then(() => refetch());
    },
    { enabled: !!verifyQuests && !!refetch }
  );

  return (
    <Flex y grow component={"main"} py={2}>
      <InjectTopBar
        title="Points"
        withBack
        endItem={
          <IconButton onClick={() => setShowPointInfoModal(true)}>
            <HelpOutline />
          </IconButton>
        }
      />
      <Card sx={{ gap: 1, border: 1, borderColor: "#CDD7E1", mx: 2 }} variant="plain">
        <Flex x xsb p={2}>
          <Flex x gap1>
            <UserAvatar user={user} size="md" />
            <Flex y>
              <Typography level="title-sm">#{position}</Typography>
              <Typography level="body-sm">Your Rank</Typography>
            </Flex>
          </Flex>
          <Typography level="h4"> {points} pts</Typography>
        </Flex>
        <Button
          onClick={async () => {
            const res = await claimPoints.mutateAsync();
            await refetch();
            if (res.count > 0) toast.success("Claimed successfully");
          }}
          disabled={unclaimedPoints > 0 ? false : true}
          loading={claimPoints.isLoading || isLoading}
          color="primary"
          size="lg"
        >
          {unclaimedPoints > 0 ? (
            "Claim " + unclaimedPoints + " points"
          ) : (
            <>
              <ParachuteIcon sx={{ mr: 1 }} /> Next drop {time}
            </>
          )}
        </Button>
        <Button color="primary" variant="plain" size="md" onClick={() => router.push("/points/history")}>
          See points history
        </Button>
      </Card>
      <Tabs defaultValue={"invited"} sx={{ mt: 2 }}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="invited"> Invited</Tab>
          <Tab value="quests">Quests</Tab>
        </TabList>
        <TabPanel value="invited" sx={{ p: 2, gap: 1 }}>
          <Flex y gap1>
            <Typography level="title-sm" textColor={"neutral.600"} fontWeight="600">
              Your unique invite codes
            </Typography>
            <Flex
              y
              sx={
                showAllInvitesCode
                  ? {
                      maxHeight: "400px",
                      overflowY: "scroll",
                      borderRadius: "10px"
                    }
                  : { maxHeight: "140px", overflowY: "hidden", borderRadius: "10px" }
              }
            >
              <ButtonGroup orientation="vertical" variant="soft" size="sm">
                {user?.inviteCodes
                  .sort((a, b) => {
                    if (b.used) return -1;
                    if (a.used) return 1;
                    return 0;
                  })
                  .map(code => (
                    <Button
                      key={code.code}
                      disabled={code.used ? true : false}
                      fullWidth
                      sx={{ minHeight: "48px" }}
                      onClick={() => {
                        window.navigator.clipboard.writeText(window.location.origin + "?inviteCode=" + code.code);
                        toast.success("Copied invite link to clipboard");
                      }}
                      color="neutral"
                      size="sm"
                      variant="soft"
                    >
                      <Flex fullwidth x xsb yc grow>
                        {code.code}
                        {code.used ? (
                          <Chip size="sm" variant="outlined">
                            Used
                          </Chip>
                        ) : (
                          <ContentCopyOutlined fontSize="small" />
                        )}
                      </Flex>
                    </Button>
                  ))}
              </ButtonGroup>
            </Flex>
            {user && user?.inviteCodes.length > 3 && (
              <Button
                size="lg"
                color="neutral"
                variant="outlined"
                onClick={() => {
                  showAllInvitesCode ? setShowAllInvitesCode(false) : setShowAllInvitesCode(true);
                }}
              >
                {showAllInvitesCode ? "Show Less" : `Show all invite codes (${user?.inviteCodes.length})`}
              </Button>
            )}
          </Flex>
          <Flex y gap2>
            <Typography level="title-sm" textColor={"neutral.600"} fontWeight="600">
              builders invited
            </Typography>
            {invitations?.map(invitation => (
              <Flex key={invitation.id} x xs gap2>
                <UserAvatar user={invitation} size="md" />
                <Flex y onClick={() => router.push(`/profile/${invitation.wallet}`)} sx={{ cursor: "pointer" }}>
                  <Typography level="title-sm">{invitation.displayName || shortAddress(invitation.wallet)} </Typography>
                  <Typography level="body-sm"> Joined in {invitation.createdAt.toLocaleDateString()}</Typography>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </TabPanel>
        <TabPanel value="quests" sx={{ p: 2 }}>
          <Flex y gap1>
            {quests?.data?.map(quest => {
              const isCompleted = userQuests && userQuests.some(key => key.questId == quest.id);
              return (
                <Card
                  sx={{ flexGrow: 1, gap: 0.5 }}
                  key={quest.id}
                  invertedColors={isCompleted}
                  variant={isCompleted ? "soft" : "outlined"}
                  color={isCompleted ? "primary" : "neutral"}
                >
                  <Flex x yc gap={0.5}>
                    {isCompleted && <CheckCircle fontSize="small" />}
                    <Typography level="title-sm">{quest.description}</Typography>
                  </Flex>
                  <Typography level="body-sm"> + {quest.points} points </Typography>
                </Card>
              );
            })}
          </Flex>
        </TabPanel>
      </Tabs>
      <PointInfo showPointInfoModal={showPointInfoModal} closePointInfo={closePointInfo} />
    </Flex>
  );
}
