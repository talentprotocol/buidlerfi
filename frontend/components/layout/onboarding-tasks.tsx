import { useUserContext } from "@/contexts/userContext";
import { useGetUserStats, useSetUserSetting } from "@/hooks/useUserApi";
import Close from "@mui/icons-material/Close";
import Alert from "@mui/joy/Alert";
import IconButton from "@mui/joy/IconButton";
import LinearProgress from "@mui/joy/LinearProgress";
import Typography from "@mui/joy/Typography";
import { UserSettingKeyEnum } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { TasksChecklistModal } from "../app/onboarding/tasks-checklist-modal";
import { Flex } from "../shared/flex";

const PWA_INSTALLED_LOCAL_STORAGE_KEY = "builderfi-onboarding-pwa-installed";

export interface OnboardingTask {
  description: string;
  preRedirect?: () => void;
  redirect: { pathname?: string; searchParams?: Record<string, string | boolean> };
  verify: () => boolean;
}

export const OnboardingTasks = () => {
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const { user, userSettings, refetch } = useUserContext();
  const { data: userStats, isLoading } = useGetUserStats(user?.id);

  const setUserSetting = useSetUserSetting();

  const isPwaInstalled = localStorage.getItem(PWA_INSTALLED_LOCAL_STORAGE_KEY) === "true";

  const tasks = useMemo(() => {
    return [
      {
        description: "ask 1 open question",
        redirect: { searchParams: { ask: true }, pathname: "/question" },
        verify: () => userStats && userStats.openQuestionsAsked > 0
      },
      {
        description: "answer 1 open question",
        redirect: { pathname: "/home", searchParams: { tab: "New" } },
        verify: () => userStats && userStats.openQuestionsReplied > 0
      },
      {
        description: "create your key to be able to gate your answers",
        redirect: { pathname: `/profile/${user?.wallet}`, searchParams: { tradeModal: "buy" } },
        //Other users can't buy the key if user has not created it. If count is 0, user hasn't launched keys
        verify: () => userStats && userStats.numberOfHolders > 0
      },
      {
        description: "buy another person's key",
        redirect: { pathname: `/wallet`, searchParams: { fundModal: "deposit" } },
        //If user has bought his key, count will be 1. If he has bought another person's key, count will be 2
        verify: () => userStats && userStats.numberOfHolding > 1
      }
    ] as OnboardingTask[];
  }, [user?.wallet, userStats, isPwaInstalled]);

  const finishedTasks = useMemo(() => {
    return tasks.filter(task => task.verify());
  }, [tasks]);

  const progress = Math.round(((finishedTasks?.length || 0) / tasks.length) * 100);

  const dontShowAgain = () => {
    setUserSetting.mutateAsync({
      key: UserSettingKeyEnum.ONBOARDING_TASKLIST_DO_NOT_SHOW_AGAIN,
      value: "true"
    });
    setIsTasksModalOpen(false);
    setIsAlertVisible(false);
    refetch();
  };

  useEffect(() => {
    if (isLoading) return;
    if (finishedTasks.length < tasks.length && userSettings?.ONBOARDING_TASKLIST_DO_NOT_SHOW_AGAIN !== "true")
      setIsAlertVisible(true);
    else setIsAlertVisible(false);
  }, [
    finishedTasks.length,
    isLoading,
    setIsAlertVisible,
    tasks.length,
    userSettings?.ONBOARDING_TASKLIST_DO_NOT_SHOW_AGAIN
  ]);

  return (
    <>
      {isTasksModalOpen && (
        <TasksChecklistModal
          progress={progress}
          tasks={tasks}
          finishedTasks={finishedTasks}
          close={() => setIsTasksModalOpen(false)}
          dontShowAgain={dontShowAgain}
        />
      )}
      {isAlertVisible && (
        <Alert
          variant="outlined"
          color="primary"
          size="sm"
          sx={{
            cursor: "pointer",
            borderRadius: 0
          }}
          endDecorator={
            <IconButton onClick={() => setIsAlertVisible(false)} color="primary" size="sm">
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Flex y grow onClick={() => setIsTasksModalOpen(true)}>
            <Typography level="title-sm" textColor={"primary.600"}>
              your first steps on builder.fi
            </Typography>
            <Flex x xc gap1>
              <Typography level="body-sm" fontWeight={400} textColor={"primary.600"}>
                {finishedTasks?.length}/{tasks.length}
              </Typography>
              <LinearProgress
                sx={{ height: "4px", alignSelf: "center" }}
                color="primary"
                determinate
                value={progress}
              />
            </Flex>
          </Flex>
        </Alert>
      )}
    </>
  );
};
