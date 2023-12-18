import { Flex } from "@/components/shared/flex";
import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { useGetBuilderInfo, useTradeKey } from "@/hooks/useBuilderFiContract";
import { formatToDisplayString } from "@/lib/utils";
import { Close } from "@mui/icons-material";
import { Button, DialogTitle, IconButton, Modal, ModalDialog, Tooltip, Typography } from "@mui/joy";
import { FC, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { parseEther } from "viem";
import { useBalance } from "wagmi";

interface Props {
  hasKeys: boolean;
  close: () => void;
  supporterKeysCount?: number;
  side: "buy" | "sell";
  isFirstKey: boolean;
  targetBuilderAddress?: `0x${string}`;
}

export const TradeKeyModal: FC<Props> = ({
  hasKeys,
  close,
  supporterKeysCount,
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
  const { refetch, buyPriceAfterFee, buyPrice, builderFee, protocolFee, sellPriceAfterFee, sellPrice } =
    useGetBuilderInfo(socialData?.wallet);

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
      tx.executeTx({ args: [targetBuilderAddress!], value: buyPriceAfterFee });
      return;
    }

    if (!buyPriceAfterFee || !balance) return;

    let buyPrice = buyPriceAfterFee;
    if (recalculatePrice) {
      const [, , , newBuyPrice] = await refetch();
      buyPrice = newBuyPrice.data || buyPriceAfterFee;
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
    if (!buyPriceAfterFee) return true;

    return (balance.value || BigInt(0)) >= buyPriceAfterFee;
  }, [side, balance, buyPriceAfterFee]);

  const enableTradeButton = () => {
    if (side === "sell") return true;
    if (isFirstKey) return true;
    if (!buyPriceAfterFee) return false;

    return hasEnoughBalance;
  };

  const modalTitle = () => {
    if (showSuccessMessage) return "What's next?";
    if (side === "buy") return "Buy key";
    return "Sell key";
  };

  const creatorFee = useMemo(() => {
    const valueToUse = side === "buy" ? buyPrice : sellPrice;
    if (!valueToUse || !builderFee) return BigInt(0);
    return (valueToUse * builderFee) / parseEther("1");
  }, [builderFee, buyPrice, sellPrice, side]);

  const platformFee = useMemo(() => {
    const valueToUse = side === "buy" ? buyPrice : sellPrice;
    if (!valueToUse || !protocolFee) return BigInt(0);
    return (valueToUse * protocolFee) / parseEther("1");
  }, [buyPrice, protocolFee, sellPrice, side]);

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
              Congrats, you bought your first {socialData?.displayName} key!
            </Typography>
            <Typography level="body-lg" textColor="neutral.600">
              The next step is asking them a question.
            </Typography>
            <Typography level="body-lg" textColor="neutral.600">
              If you&apos;re bullish on {socialData?.displayName}, you can buy multiple keys!
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
              {hasKeys
                ? `You own ${supporterKeysCount} ${supporterKeysCount && supporterKeysCount > 1 ? "keys" : "key"}`
                : "You don't own any keys"}
            </Typography>
            <Tooltip title="The price of the next key is equal to the S^2 / 16000 * 1 ETH, where S is the current number of keys.">
              <Flex x yc xsb>
                <Typography textColor="neutral.600">{side === "buy" ? "Buy" : "Sell"} price:</Typography>
                <Typography>{formatToDisplayString(side === "buy" ? buyPrice : sellPrice)} ETH</Typography>
              </Flex>
            </Tooltip>
            <Flex x yc gap1 xsb>
              {builderFee !== undefined && (
                <Typography textColor="neutral.600">
                  Key Creator Fee ({formatToDisplayString(builderFee * BigInt(100))}%):
                </Typography>
              )}
              <Typography>{formatToDisplayString(creatorFee)} ETH</Typography>
            </Flex>
            <Flex x yc gap1 xsb>
              {protocolFee !== undefined && (
                <Typography textColor="neutral.600">
                  Platform Fee ({formatToDisplayString(protocolFee * BigInt(100))}%):
                </Typography>
              )}
              <Typography>{formatToDisplayString(platformFee)} ETH</Typography>
            </Flex>
            <Flex x yc gap1 xsb>
              <Typography textColor="neutral.600">You will {side === "buy" ? "spend" : "receive"}: </Typography>
              <Typography level="title-lg">
                {formatToDisplayString(side === "buy" ? buyPriceAfterFee : sellPriceAfterFee)} ETH
              </Typography>
            </Flex>

            {!hasEnoughBalance && (
              <Flex x yc>
                <Typography level="body-md" textColor="danger.400">
                  Insufficient funds. Go to <a href={"/wallet"}>Wallet</a> and deposit ETH.
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
