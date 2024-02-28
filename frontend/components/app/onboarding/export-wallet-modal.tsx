import { Flex } from "@/components/shared/flex";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import { FC } from "react";

interface Props {
  onClose: () => void;
  onExport: () => void;
}

export const ExportWalletModal: FC<Props> = ({ onClose, onExport }) => {
  return (
    <Modal open={true} onClose={onClose}>
      <ModalDialog sx={{ width: "min(100vw, 500px)", padding: 0, minHeight: "300px" }}>
        <ModalClose />
        <Flex y p={2} gap2 grow>
          <Typography className="remove-text-transform" textAlign="center" mb={2} level="h3">
            Back Up
          </Typography>
          <Flex y gap={1}>
            <ul style={{ paddingInlineStart: "16px", margin: 0 }}>
              <li style={{ marginBottom: "8px" }}>
                <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
                  builder.fi created a new self-custodial wallet for you (using Privy), to make the app experience much
                  smoother.
                </Typography>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
                  Reminder: Never disclose this key. Anyone with your private key can control your account.
                </Typography>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
                  you can access your private key anytime on the app settings
                </Typography>
              </li>
            </ul>
          </Flex>
          <Flex x xe gap1>
            <Button variant="outlined" color="neutral" onClick={onClose}>
              Export later
            </Button>
            <Button onClick={onExport}>Export now</Button>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
