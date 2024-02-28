import { useUserContext } from "@/contexts/userContext";
import { useUpdateUser } from "@/hooks/useUserApi";
import { formatError } from "@/lib/utils";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC } from "react";
import { toast } from "react-toastify";
import { Flex } from "../shared/flex";

interface Props {
  close: () => void;
  openModal: boolean;
}

export const WelcomeModal: FC<Props> = ({ openModal, close }) => {
  const updateUser = useUpdateUser();
  const { user: currentUser, refetch } = useUserContext();
  const handleFinishOnboarding = async () => {
    if (!currentUser?.hasFinishedOnboarding) {
      await updateUser
        .mutateAsync({ hasFinishedOnboarding: true })
        .then(async () => {
          toast.success("You are ready to go!");
          close();
          await Promise.allSettled([refetch()]);
        })
        .catch(e => toast.error(formatError(e)));
    }
  };
  return (
    <Modal
      open={openModal}
      onClose={reason => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") close();
      }}
    >
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex y p={2} gap={1}>
          <Typography level="h3">{"you're in! now what?"}</Typography>
          <Typography level="body-lg" textColor={"neutral.600"}>
            1. Find a friend or an interesting builder.
            <br />
            2. Buy their key to reveal past answers. <br />
            3. Ask them a question. <br />
            4. Sell the key at anytime.
          </Typography>
          <Button fullWidth size="lg" sx={{ mt: 2 }} onClick={handleFinishOnboarding} loading={updateUser.isLoading}>
            Let&apos;s do this
          </Button>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
