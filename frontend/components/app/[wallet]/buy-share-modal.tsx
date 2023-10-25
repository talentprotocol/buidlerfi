import { Flex } from "@/components/shared/flex";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BASE_GOERLI_TESTNET } from "@/lib/constants";
import { formatError, formatEth } from "@/lib/utils";
import { Button, DialogTitle, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC, useRef } from "react";
import { toast } from "react-toastify";
import { useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";

interface Props {
  hasKeys: boolean;
  open: boolean;
  close: () => void;
  buyPrice?: bigint;
  sellPrice?: bigint;
  socialData: SocialData;
  supporterKeysCount?: bigint;
}

export const BuyShareModal: FC<Props> = ({
  hasKeys,
  open,
  close,
  buyPrice,
  sellPrice,
  socialData,
  supporterKeysCount
}) => {
  const toastId = useRef<string | number | undefined>(undefined);

  const { data: buyPriceAfterFee } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "getBuyPriceAfterFee",
    args: [socialData.address]
  });

  const {
    data: tx_buy,
    write: contractBuyKeys,
    isLoading: buyIsLoading
  } = useContractWrite({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "buyShares",
    onSuccess: () => {
      toastId.current = toast("Transaction submitted!", { isLoading: true });
    },
    onError: (err: unknown) => {
      toast.error("There was an error processing your transaction: " + formatError(err));
    }
  });

  const {
    data: tx_sell,
    write: contractSellKeys,
    isLoading: sellIsLoading
  } = useContractWrite({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "sellShares",
    onSuccess: () => {
      toastId.current = toast("Transaction submitted!", { isLoading: true });
    },
    onError: (err: unknown) => {
      toast.error("There was an error processing your transaction: " + formatError(err));
    }
  });

  const { isLoading: buyTxProcessing } = useWaitForTransaction({
    hash: tx_buy?.hash,
    onSuccess: () => {
      toast.update(toastId.current!, {
        render: `You bought a card of ${socialData.name} !`,
        isLoading: false,
        type: "success",
        autoClose: 3000
      });
      close();
    }
  });

  const { isLoading: sellTxProcessing } = useWaitForTransaction({
    hash: tx_sell?.hash,
    onSuccess: () => {
      toast.update(toastId.current!, {
        render: `You sold a card of ${socialData.name} !`,
        isLoading: false,
        type: "success",
        autoClose: 3000
      });
      close();
    }
  });

  const isLoading = buyIsLoading || sellIsLoading || buyTxProcessing || sellTxProcessing;

  return (
    <Modal open={open} onClose={close}>
      <ModalDialog minWidth="400px">
        <DialogTitle>{hasKeys ? "Trade" : "Buy"} Cards</DialogTitle>

        <Flex y gap3>
          <Flex x yc xsb>
            <Flex y>
              <Typography level="body-md">{socialData.name}</Typography>
              <Typography level="body-sm" textColor="neutral.400">
                {hasKeys ? `You own ${supporterKeysCount} cards` : "You don't own any cards"}
              </Typography>
            </Flex>
            <Flex y>
              <Typography level="body-md">{formatEth(buyPrice)} ETH</Typography>
              <Typography level="body-sm" textColor="neutral.400">
                Card price
              </Typography>
            </Flex>
          </Flex>
          <Flex y gap1>
            <Flex x yc gap3 alignSelf={"center"}>
              <Button
                loading={buyIsLoading}
                disabled={isLoading}
                onClick={() => contractBuyKeys({ args: [socialData.address], value: buyPriceAfterFee })}
                className="mt-4"
              >
                Buy a card
              </Button>
              {hasKeys && (
                <Button
                  variant="outlined"
                  onClick={() => contractSellKeys({ args: [socialData.address, BigInt(1)] })}
                  loading={sellIsLoading}
                  disabled={isLoading}
                  className="mt-2"
                >
                  Sell a card
                </Button>
              )}
            </Flex>
            {hasKeys && (
              <Typography level="body-sm" alignSelf={"center"} textColor="neutral.400">
                Sell price: {formatEth(sellPrice)}
              </Typography>
            )}
          </Flex>

          <Button variant="plain" onClick={() => close()} disabled={isLoading}>
            Cancel
          </Button>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
