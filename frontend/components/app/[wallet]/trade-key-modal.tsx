import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useTradeKey } from "@/hooks/useBuilderFiContract";
import { formatToDisplayString } from "@/lib/utils";
import { Close } from "@mui/icons-material";
import { Button, DialogTitle, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useBalance } from "wagmi";

interface Props {
  hasKeys: boolean;
  close: () => void;
  sellPrice?: bigint;
  buyPriceWithFees?: bigint;
  supporterKeysCount?: number;
  side: "buy" | "sell";
  isFirstKey: boolean;
  targetBuilderAddress: `0x${string}`;
}

export const TradeKeyModal: FC<Props> = ({
  hasKeys,
  close,
  sellPrice,
  supporterKeysCount,
  buyPriceWithFees,
  isFirstKey,
  side,
  targetBuilderAddress
}) => {
  const { address } = useUserContext();
  const { data: balance } = useBalance({
    address
  });
  const tx = useTradeKey(side, () => closeOrShowSuccessPurchase());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const closeOrShowSuccessPurchase = () => {
    if (hasKeys) {
      close();
    } else {
      // Check if the success message has already been shown
      const hasShownSuccessMessage = localStorage.getItem("hasShownSuccessMessage");

      // If it hasn't been shown, show it and update localStorage
      if (!hasShownSuccessMessage) {
        setShowSuccessMessage(true);
        localStorage.setItem("hasShownSuccessMessage", "true");
      } else {
        close();
      }
    }
  };

  const handleBuy = () => {
    if (isFirstKey) {
      tx.executeTx({ args: [targetBuilderAddress!], value: buyPriceWithFees });
      return;
    }

    if (!buyPriceWithFees || !balance) return;

    if (buyPriceWithFees > balance.value) {
      toast.error(
        `Insufficient balance. You have: ${formatToDisplayString(
          balance.value,
          18
        )} ETH. You need: ${formatToDisplayString(buyPriceWithFees, 18)} ETH`
      );
      return;
    }

    tx.executeTx({ args: [targetBuilderAddress!], value: buyPriceWithFees });
  };

  const handleSell = () => {
    tx.executeTx({ args: [targetBuilderAddress!] });
  };

  const hasEnoughBalance = useMemo(() => {
    if (side === "sell") return true;
    if (!balance) return false;
    if (!buyPriceWithFees) return true;

    return (balance.value || BigInt(0)) >= buyPriceWithFees;
  }, [side, balance, buyPriceWithFees]);

  const enableTradeButton = () => {
    if (side === "sell") return true;
    if (isFirstKey) return true;
    if (!buyPriceWithFees) return false;

    return hasEnoughBalance;
  };

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog minWidth="400px">
        <Flex x xsb yc>
          <DialogTitle>{side === "buy" ? "Buy" : "Sell"} 1 Key</DialogTitle>
          <IconButton onClick={close}>
            <Close />
          </IconButton>
        </Flex>

        {showSuccessMessage ? (
          <Flex y gap1>
            <Typography level="body-lg" textColor="neutral.600">
              Congratulations, you bought your first key!
            </Typography>
            <Typography level="body-lg" textColor="neutral.600">
              Next step is asking a question, If you are bullish on this person you can buy multiple keys
            </Typography>
            <Flex x yc gap1 alignSelf="flex-end" mt={2}>
              <Button variant="outlined" onClick={() => close()}>
                Close
              </Button>
              <Button loading={tx.isLoading} onClick={() => handleBuy()} disabled={!enableTradeButton()}>
                Buy More
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex y gap1>
            <Typography level="body-lg" textColor="neutral.600">
              {hasKeys ? `You own ${supporterKeysCount} keys` : "You don't own any keys"}
            </Typography>
            <Flex x yc gap1>
              <Typography level="body-lg" textColor="neutral.600">
                {side === "buy" ? "Buy" : "Sell"} price
              </Typography>
              <Typography level="title-lg">
                {formatToDisplayString(side === "buy" ? buyPriceWithFees : sellPrice)} ETH
              </Typography>
            </Flex>
            {!hasEnoughBalance && (
              <Flex x yc>
                <Typography level="body-md" textColor="danger.400">
                  Insufficient funds. Please top up your wallet.
                </Typography>
              </Flex>
            )}
            <Flex y gap1 mt={2}>
              <Flex x yc gap1 alignSelf="flex-end">
                <Button variant="outlined" color="neutral" onClick={() => close()} disabled={tx.isLoading}>
                  Cancel
                </Button>

                <Button
                  loading={tx.isLoading}
                  onClick={() => (side === "sell" ? handleSell() : handleBuy())}
                  disabled={!enableTradeButton()}
                >
                  {side === "buy" ? "Buy" : "Sell"} 1 key
                </Button>
              </Flex>
            </Flex>
          </Flex>
        )}
      </ModalDialog>
    </Modal>
  );
};
