import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useTradeKey } from "@/hooks/useBuilderFiContract";
import { formatToDisplayString } from "@/lib/utils";
import { Close } from "@mui/icons-material";
import { Button, DialogTitle, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC, useMemo } from "react";
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
}

export const TradeKeyModal: FC<Props> = ({
  hasKeys,
  close,
  sellPrice,
  supporterKeysCount,
  buyPriceWithFees,
  isFirstKey,
  side
}) => {
  const { address } = useUserContext();
  const { data: balance } = useBalance({
    address
  });
  const tx = useTradeKey(side, () => close());

  const handleBuy = () => {
    if (isFirstKey) {
      tx.executeTx({ args: [address!], value: buyPriceWithFees });
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

    tx.executeTx({ args: [address!], value: buyPriceWithFees });
  };

  const handleSell = () => {
    tx.executeTx({ args: [address!] });
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
      </ModalDialog>
    </Modal>
  );
};
