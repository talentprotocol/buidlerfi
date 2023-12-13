import { Flex } from "@/components/shared/flex";
import { Close, IosShare } from "@mui/icons-material";
import { Button, DialogTitle, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { useState } from "react";

export function AddToHomePage() {
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setInstructionsOpen(true)}>Install App</Button>
      <Modal open={instructionsOpen} onClose={() => setInstructionsOpen(false)}>
        <ModalDialog minWidth="400px">
          <Flex x xsb yc>
            <DialogTitle>Install App</DialogTitle>
            <IconButton onClick={() => setInstructionsOpen(false)}>
              <Close />
            </IconButton>
          </Flex>
          <Typography level="body-sm" textColor="neutral.500">
            Add builder.fi to your home screen to get the best experience
          </Typography>
          <Flex x yc gap={2}>
            <Typography level="body-sm" textColor="neutral.500">
              1. Click the share button
            </Typography>
            <IosShare />
          </Flex>
          <Typography level="body-sm" textColor="neutral.500">
            2. Scroll down
          </Typography>
          <Typography level="body-sm" textColor="neutral.500">
            3. Click &quot;Add to Home Screen&quot;
          </Typography>
        </ModalDialog>
      </Modal>
    </>
  );
}
