import DialogTitle from "@mui/joy/DialogTitle";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC } from "react";
import { Flex } from "./flex";

interface Props {
  showPointInfoModal: boolean;
  closePointInfo: () => void;
}

export const PointInfo: FC<Props> = ({ showPointInfoModal, closePointInfo }) => {
  return (
    <Modal open={showPointInfoModal} onClose={closePointInfo}>
      <ModalDialog minWidth="400px">
        <ModalClose />
        <Flex x xsb yc>
          <DialogTitle sx={{ fontWeight: "700", fontSize: "20px" }}>About points</DialogTitle>
        </Flex>
        <Flex y gap2>
          <Typography level="body-lg" textColor="neutral.600">
            Earn points by inviting builders, asking and answering questions and trading keys. Points are airdropped
            every Friday and will have future uses in builder.fi and the Talent Protocol ecosystem
          </Typography>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
