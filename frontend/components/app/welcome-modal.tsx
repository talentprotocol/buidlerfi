import { useBetterRouter } from "@/hooks/useBetterRouter";
import { WELCOME_MODAL } from "@/lib/assets";
import { Button, Modal, ModalDialog, Typography } from "@mui/joy";
import { Flex } from "../shared/flex";

export const WelcomeModal = () => {
  const router = useBetterRouter();
  const handleCloseModal = () => {
    router.replace({ searchParams: { welcome: undefined } });
  };
  return (
    <Modal open={true} onClose={handleCloseModal}>
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex sx={{ backgroundColor: "primary.50" }}>
          <img src={WELCOME_MODAL} width="100%" />
        </Flex>
        <Flex y p={2} gap={1}>
          <Typography level="h3">You&apos;re in, congrats !</Typography>
          <Typography level="body-lg" textColor={"neutral.600"}>
            Here&apos;s what to do next: <br />
            1. Find a friend on an interesting builder.
            <br />
            2. Buy their key to reveal past answers. <br />
            3. Ask then a question. <br />
            4. Sell the key at anytime.
          </Typography>
          <Button fullWidth size="lg" sx={{ mt: 2 }} onClick={handleCloseModal}>
            Let&apos;s do it!
          </Button>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
