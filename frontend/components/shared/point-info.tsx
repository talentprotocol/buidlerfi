import { DialogTitle, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { Flex } from "./flex";
import { Close } from "@mui/icons-material";
import { FC } from "react";

interface Props {
  showPointInfoModal: boolean;
  closePointInfo: () => void;
}

export const PointInfo: FC<Props> = ({ showPointInfoModal, closePointInfo }) => {
  return (
    <Modal open={Boolean(showPointInfoModal)} onClose={closePointInfo}>
      <ModalDialog minWidth="400px">
        <Flex x xsb yc>
          <DialogTitle>About points</DialogTitle>
          <IconButton onClick={closePointInfo}>
            <Close />
          </IconButton>
        </Flex>
        <Flex y gap2>
          <Typography level="body-sm">
            Earn points by inviting builders, asking and answering questions and trading keys. Points are airdropped
            every Friday and will have future uses in builder.fi and the Talent Protocol ecosystem
          </Typography>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
