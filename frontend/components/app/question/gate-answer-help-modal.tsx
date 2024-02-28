import { Flex } from "@/components/shared/flex";
import DialogTitle from "@mui/joy/DialogTitle";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC } from "react";

interface Props {
  close: () => void;
}

export const GateAnswerHelpModal: FC<Props> = ({ close }) => {
  return (
    <Modal open={true} onClose={close}>
      <ModalDialog minWidth="400px">
        <Flex x xsb yc>
          <DialogTitle sx={{ fontWeight: "700", fontSize: "20px" }}>About gated answers</DialogTitle>
          <ModalClose />
        </Flex>
        <Flex y gap2>
          <Typography level="body-lg" textColor="neutral.600">
            When you launch your keys, you can gate your answers to only be revealed to those who have the key. This
            allows you to monetize your answers and create a more exclusive experience for your followers.
          </Typography>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
