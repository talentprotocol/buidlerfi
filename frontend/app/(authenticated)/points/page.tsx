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
import { getFullTimeDifference } from "@/lib/utils";
import { CheckCircle, HelpOutline } from "@mui/icons-material";
import { Button, Card, IconButton, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

export default function Invite() {
  const { user, refetch, isLoading } = useUserContext();
  const { data: currentPosition } = useGetCurrentPosition();
  const [showPointInfoModal, setShowPointInfoModal] = useState(false);
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
            <HelpOutline fontSize="small" />
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
      <Typography level="title-md" mt={2} mb={1} px={2}>
        Quests
      </Typography>
      <Flex y gap1 px={2}>
        {quests?.data?.map(quest => {
          const isCompleted = userQuests && userQuests.some(key => key.questId == quest.id);
          let newUrl = quest.path;
          if (quest.path?.includes("[wallet]")) {
            const wallet = user?.wallet.toString();
            if (wallet) {
              newUrl = quest.path.replace("[wallet]", wallet);
            }
          } else {
            newUrl = quest.path;
          }
          return (
            <Card
              sx={{ flexGrow: 1, gap: 0.5 }}
              key={quest.id}
              invertedColors={isCompleted}
              variant={isCompleted ? "soft" : "outlined"}
              color={isCompleted ? "primary" : "neutral"}
              onClick={() => {
                if (!isCompleted && newUrl) {
                  router.push(newUrl);
                  close();
                }
              }}
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
      <PointInfo showPointInfoModal={showPointInfoModal} closePointInfo={closePointInfo} />
    </Flex>
  );
}
