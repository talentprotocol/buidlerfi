import { Flex } from "@/components/flex";
import { useToast } from "@/components/ui/use-toast";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BASE_GOERLI_TESTNET } from "@/lib/address";
import { formatEth } from "@/lib/utils";
import { Button, DialogTitle, Modal, ModalDialog, Typography } from "@mui/joy";
import { FC } from "react";
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
  const { toast } = useToast();

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
    onSuccess: ({ hash }) => {
      toast({
        title: "Transaction submitted!",
        description: `Hash: ${hash}`
      });
    },
    onError: () => {
      toast({
        title: "Unable to buy card",
        description: `There was an error processing your transaction`
      });
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
    onSuccess: ({ hash }) => {
      toast({
        title: "Transaction submitted!",
        description: `Hash: ${hash}`
      });
    },
    onError: () => {
      toast({
        title: "Unable to sell card",
        description: `There was an error processing your transaction`
      });
    }
  });

  const {} = useWaitForTransaction({
    hash: tx_buy?.hash,
    onSuccess: () => {
      toast({
        title: "Card bought!",
        description: `You bought a card of ${socialData.name}.`
      });
      close();
    }
  });

  const {} = useWaitForTransaction({
    hash: tx_sell?.hash,
    onSuccess: () => {
      toast({
        title: "Card sold!",
        description: `You sold a card of ${socialData.name}.`
      });
      close();
    }
  });

  const isLoading = buyIsLoading || sellIsLoading;

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
                disabled={sellIsLoading}
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
                  disabled={buyIsLoading}
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
