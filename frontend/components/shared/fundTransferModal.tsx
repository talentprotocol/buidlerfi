import { shortAddress } from "@/lib/utils";
import { ContentCopy, CopyAll } from "@mui/icons-material";
import { Button, DialogTitle, IconButton, Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import { FC } from "react";
import { toast } from "react-toastify";
import { Flex } from "./flex";

interface Props {
  address?: string;
  close: () => void;
  type: "transfer" | "bridge";
}

export const FundWalletModal: FC<Props> = ({ address, close, type }) => {
  const renderBridgeContent = () => {
    return (
      <>
        <Typography level="body-md" textColor="neutral.600">
          <strong>1.</strong> Copy your builder.fi wallet address <strong>{shortAddress(address || "")}</strong>{" "}
          <IconButton
            onClick={() => {
              navigator.clipboard.writeText(address || "");
              toast.success("Copied to clipboard");
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>2.</strong> Go to{" "}
          <a href="https://bungee.exchange" target="_blank">
            bungee.exchange
          </a>
          , on desktop or mobile
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>3.</strong> Connect a wallet with funds
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>4.</strong> Click on “+ Add Address” and paste your builder.fi address
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>5.</strong> Pick your preferred source chain and token to bridge
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>6.</strong> Confirm the transaction in your wallet
        </Typography>
      </>
    );
  };

  const renderTransferContent = () => {
    return (
      <>
        <Typography level="body-md" textColor="neutral.600">
          <strong>1.</strong> Copy your builder.fi wallet address <strong>{shortAddress(address || "")}</strong>{" "}
          <IconButton
            onClick={() => {
              navigator.clipboard.writeText(address || "");
              toast.success("Copied to clipboard");
            }}
          >
            <CopyAll />
          </IconButton>
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>2.</strong> Go to your wallet (ex: Metamask) or exchange (ex: Coinbase or Binance)
        </Typography>
        <Typography level="body-md" textColor="neutral.600">
          <strong>3.</strong> Send ETH on the Base network to your builder.fi address
        </Typography>
      </>
    );
  };

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog minWidth="400px">
        <ModalClose />
        <DialogTitle>
          {type === "transfer"
            ? "Transfer ETH on Base to builder.fi wallet"
            : "Bridge crypto from another chain to builder.fi wallet"}
        </DialogTitle>
        <Flex y gap2>
          {type === "bridge" ? renderBridgeContent() : renderTransferContent()}
          <Button sx={{ marginTop: 2 }} onClick={() => close()}>
            Done
          </Button>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
