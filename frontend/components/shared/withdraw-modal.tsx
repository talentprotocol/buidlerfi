"use client";
import { Flex } from "@/components/shared/flex";
import { IN_USE_CHAIN_ID } from "@/lib/constants";
import { Close } from "@mui/icons-material";
import {
  Button,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Typography
} from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { toast } from "react-toastify";
import { parseEther } from "viem";

interface DialogType {
  balance: bigint;
  close: () => void;
  formattedBalance: string;
}

export const WithdrawDialog = ({ balance, close, formattedBalance }: DialogType) => {
  const { sendTransaction } = usePrivy();
  const [target, setTarget] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [withdrawing, setWithdrawing] = useState<boolean>(false);

  const sendTransactionHandler = async () => {
    if (!(target.includes("0x") && target.length == 42)) {
      toast.error("we only support ETH addresses");
      return false;
    }

    const value = parseEther(amount);
    if (!(value > 0 && value <= balance)) {
      toast.error("Amount must be greater than 0 and you must have sufficient balance");
      return false;
    }

    setWithdrawing(true);

    const unsignedTx = {
      to: target,
      chainId: IN_USE_CHAIN_ID,
      value: value
    };

    // Replace this with the text you'd like on your transaction modal
    const uiConfig = {
      header: "Withdraw from builder.fi",
      description: "You are withdrawing ETH from builder.fi on BASE",
      buttonText: "Withdraw"
    };

    const txReceipt = await sendTransaction(unsignedTx, uiConfig);

    if (txReceipt) {
      toast.success(`Transaction sent successfully: ${txReceipt.transactionHash}`);
    }
    setWithdrawing(false);
    close();
  };

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog minWidth="400px">
        <Flex x xsb yc>
          <DialogTitle>Withdraw ETH</DialogTitle>
          <IconButton onClick={close}>
            <Close />
          </IconButton>
        </Flex>
        <Flex y gap1>
          <Typography level="body-lg" textColor="neutral.600">
            Your current balance is
            <br />
            {`${formattedBalance} ETH`}
          </Typography>
          <Flex y yc gap2 mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <Input value={target} onChange={e => setTarget(e.target.value)} placeholder="0x..." />
              <FormHelperText>Add the address you want to withdraw to</FormHelperText>
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.01" />
              <FormHelperText>Amount you want to withdraw</FormHelperText>
            </FormControl>
          </Flex>
          <Flex y gap1 mt={2}>
            <Flex x yc gap1 alignSelf="flex-end">
              <Button variant="outlined" color="neutral" onClick={() => close()} disabled={withdrawing}>
                Cancel
              </Button>
              <Button loading={withdrawing} onClick={() => sendTransactionHandler()} disabled={withdrawing}>
                Withdraw
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
