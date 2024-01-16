import { Close } from "@mui/icons-material";
import { DialogTitle, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
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
        <Flex x xsb yc>
          <DialogTitle sx={{ fontWeight: "700", fontSize: "20px" }}>About points</DialogTitle>
          <IconButton onClick={closePointInfo}>
            <Close />
          </IconButton>
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
