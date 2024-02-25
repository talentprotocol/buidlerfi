import { OnboardingTask } from "@/components/layout/onboarding-tasks";
import { Flex } from "@/components/shared/flex";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import LinearProgress from "@mui/joy/LinearProgress";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC } from "react";

interface Props {
  progress: number;
  tasks: OnboardingTask[];
  finishedTasks: OnboardingTask[];
  close: () => void;
  dontShowAgain: () => void;
}

export const TasksChecklistModal: FC<Props> = ({ tasks, finishedTasks, progress, close, dontShowAgain }) => {
  const router = useBetterRouter();

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <ModalClose />
        <Flex y gap1 px={2} py={1}>
          <Typography level="title-lg" py={1}>
            your first steps on builder.fi
          </Typography>
          <Flex x yc gap2 mb={1}>
            <Typography level="body-sm">
              {finishedTasks.length}/{tasks.length}
            </Typography>
            <LinearProgress determinate value={progress} />
          </Flex>

          {tasks.map(task => {
            const isCompleted = finishedTasks.some(t => t.description === task.description);
            return (
              <Card
                sx={{
                  flexGrow: 1,
                  gap: 0.5,
                  cursor: isCompleted ? "undefined" : "pointer",
                  ":hover": isCompleted ? undefined : { filter: "brightness(0.95)" }
                }}
                key={task.description}
                invertedColors={isCompleted}
                variant={isCompleted ? "soft" : "outlined"}
                color={isCompleted ? "primary" : "neutral"}
                onClick={() => {
                  if (task.preRedirect) task.preRedirect();
                  router.push(task.redirect);
                  close();
                }}
              >
                <Flex x yc gap={1}>
                  {isCompleted && <CheckCircle fontSize="small" />}
                  <Typography level="title-sm">{task.description}</Typography>
                </Flex>
              </Card>
            );
          })}

          <Flex x xe gap1 py={1}>
            <Button variant="outlined" color="neutral" size="md" onClick={dontShowAgain}>
              Don&apos;t show again
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="md"
              onClick={() => {
                close();
              }}
            >
              Close
            </Button>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
