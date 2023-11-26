import { Flex } from "@/components/shared/flex";
import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo, useTradeKey } from "@/hooks/useBuilderFiContract";
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
  const { socialData } = useProfileContext();
  const { refetch, buyPriceAfterFee } = useGetBuilderInfo(socialData?.wallet);

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

  const handleBuy = async (recalculatePrice = false) => {
    if (isFirstKey) {
      tx.executeTx({ args: [targetBuilderAddress!], value: buyPriceWithFees });
      return;
    }

    if (!buyPriceWithFees || !balance) return;

    let buyPrice = buyPriceWithFees;
    if (recalculatePrice) {
      await refetch();
      buyPrice = buyPriceAfterFee || buyPriceWithFees;
    }

    if (buyPrice > balance.value) {
      toast.error(
        `Insufficient balance. You have: ${formatToDisplayString(
          balance.value,
          18
        )} ETH. You need: ${formatToDisplayString(buyPrice, 18)} ETH`
      );
      return;
    }

    tx.executeTx({ args: [targetBuilderAddress!], value: buyPrice });
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

  const modalTitle = () => {
    if (showSuccessMessage) return "What's next?";
    if (side === "buy") return "Buy 1 key";
    return "Sell 1 key";
  };

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog minWidth="400px">
        <Flex x xsb yc>
          <DialogTitle>{modalTitle()}</DialogTitle>
          <IconButton onClick={close}>
            <Close />
          </IconButton>
        </Flex>

        {showSuccessMessage ? (
          <Flex y gap1>
            <Typography level="body-lg" textColor="neutral.600">
              Congrats, you bought your first {socialData.displayName} key!
            </Typography>
            <Typography level="body-lg" textColor="neutral.600">
              The next step is asking them a question.
            </Typography>
            <Typography level="body-lg" textColor="neutral.600">
              If you&apos;re bullish on {socialData.displayName}, you can buy multiple keys!
            </Typography>
            <Flex x yc gap1 alignSelf="flex-end" mt={2}>
              <Button variant="outlined" onClick={() => close()}>
                Close
              </Button>
              <Button loading={tx.isLoading} onClick={() => handleBuy(true)} disabled={!enableTradeButton()}>
                Buy 1 more
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
