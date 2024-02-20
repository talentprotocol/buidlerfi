import { Flex } from "@/components/shared/flex";
import { WELCOME_MODAL } from "@/lib/assets";
import { Button, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC } from "react";
import { useCreateUser } from "@/hooks/useUserApi";
import { toast } from "react-toastify";
import { formatError } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useUserContext } from "@/contexts/userContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBetterRouter } from "@/hooks/useBetterRouter";

interface Props {
  openModal: boolean;
  close: () => void;
}
export const OnboardingModal: FC<Props> = ({ openModal, close }) => {
  const { user: currentUser, refetch } = useUserContext();
  const router = useBetterRouter();
  const profile = useUserProfile(currentUser?.wallet);
  const { exportWallet } = usePrivy();
  const createUser = useCreateUser();
  const createNewUser = async () => {
    await createUser
      .mutateAsync()
      .catch(e => toast.error(formatError(e)))
      .finally(async () => {
        await Promise.allSettled([profile.refetch(), refetch()]);
        router.replace("/home");
        close();
      });
    exportWallet();
  };

  return (
    <Modal
      open={openModal}
      onClose={reason => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") close();
      }}
    >
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0 }}>
        <Flex sx={{ backgroundColor: "primary.50" }}>
          <img src={WELCOME_MODAL} width="100%" />
        </Flex>
        <Flex y p={2} gap={1}>
          <Typography level="h3">{"welcome to builder.fi"}</Typography>
          <Typography level="body-sm" textColor={"neutral.600"}>
            1. Connect Your Web3 Social Wallet.
            <br />
            2. Choose 3 areas of expertise <br />
            3. Create your keys. <br />
            4. Sell the key at anytime.
          </Typography>
          <Button fullWidth size="lg" sx={{ mt: 2 }} onClick={createNewUser} loading={createUser.isLoading}>
            Get Start
          </Button>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
