import { Flex } from "@/components/shared/flex";
import { useTradeKey } from "@/hooks/useBuilderFiContract";
import { SocialData } from "@/hooks/useSocialData";
import { formatEth } from "@/lib/utils";
import { Close } from "@mui/icons-material";
import { Button, DialogTitle, IconButton, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC } from "react";

interface Props {
  hasKeys: boolean;
  close: () => void;
  buyPrice?: bigint;
  sellPrice?: bigint;
  buyPriceWithFees?: bigint;
  socialData: SocialData;
  supporterKeysCount?: number;
  side: "buy" | "sell";
}

export const TradeKeyModal: FC<Props> = ({
  hasKeys,
  close,
  buyPrice,
  sellPrice,
  socialData,
  supporterKeysCount,
  buyPriceWithFees,
  side
}) => {
  const tx = useTradeKey(side);

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
            <Typography level="title-lg">{formatEth(side === "buy" ? buyPrice : sellPrice)} ETH</Typography>
          </Flex>
          <Flex y gap1 mt={2}>
            <Flex x yc gap1 alignSelf="flex-end">
              <Button variant="outlined" color="neutral" onClick={() => close()} disabled={tx.isLoading}>
                Cancel
              </Button>

              <Button
                loading={tx.isLoading}
                onClick={() =>
                  side === "sell"
                    ? tx.executeTx({ args: [socialData.address, BigInt(1)] })
                    : tx.executeTx({ args: [socialData.address], value: buyPriceWithFees })
                }
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
