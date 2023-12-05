import { BUILDERFI_CONTRACT } from "@/lib/constants";
import { formatError } from "@/lib/utils";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";

export const useGetBuilderInfo = (address: string) => {
  const { data: buyPriceAfterFee, refetch: refetchBuyPriceAfterFee } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "getBuyPriceAfterFee",
    args: [address as `0x${string}`],
    enabled: !!address
  });

  const {
    data: buyPrice,
    isLoading: isLoadingBuyPrice,
    refetch: refetchBuyPrice
  } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "getBuyPrice",
    args: [address as `0x${string}`],
    enabled: !!address
  });

  const {
    data: sellPrice,
    refetch: refetchSellprice,
    isLoading: isLoadingSellPrice
  } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "getSellPrice",
    args: [address as `0x${string}`, BigInt(1)],
    enabled: !!address
  });

  const {
    data: sellPriceAfterFee,
    refetch: refetchSellpriceAfterFee,
    isLoading: isLoadingSellPriceAfterFee
  } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "getSellPriceAfterFee",
    args: [address as `0x${string}`, BigInt(1)],
    enabled: !!address
  });

  const {
    data: supply,
    refetch: refetchTotalSupply,
    isLoading: isLoadingSupply
  } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "builderKeysSupply",
    args: [address as `0x${string}`],
    enabled: !!address
  });

  const { data: protocolFee } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "protocolFeePercent"
  });

  const { data: builderFee } = useContractRead({
    ...BUILDERFI_CONTRACT,
    functionName: "builderFeePercent"
  });

  const refetch = async () => {
    return Promise.all([
      refetchTotalSupply(),
      refetchBuyPrice(),
      refetchSellprice(),
      refetchBuyPriceAfterFee(),
      refetchSellpriceAfterFee()
    ]);
  };

  return {
    refetch: refetch,
    supply,
    buyPriceAfterFee,
    buyPrice,
    sellPrice,
    isLoading: isLoadingBuyPrice || isLoadingSellPrice || isLoadingSupply || isLoadingSellPriceAfterFee,
    protocolFee,
    builderFee,
    sellPriceAfterFee
  };
};

const TRADE_DATA = {
  sell: {
    functionName: "sellShares",
    successMsg: "You sold a key !"
  },
  buy: {
    functionName: "buyShares",
    successMsg: "You bought a key !"
  }
} as const;

export const useTradeKey = (side: "buy" | "sell", successFn?: () => void, errorFn?: () => void) => {
  const toastId = useRef<string | number | undefined>(undefined);

  const {
    data: tx,
    writeAsync,
    isLoading
  } = useContractWrite({
    ...BUILDERFI_CONTRACT,
    functionName: TRADE_DATA[side].functionName,
    onSuccess: () => {
      toastId.current = toast("Transaction submitted!", { isLoading: true });
    },
    onError: (err: any) => {
      if (err?.shortMessage !== "User rejected the request.") {
        toast.error("There was an error processing your transaction: " + formatError(err));
      }
      errorFn && errorFn();
    }
  });

  const { isLoading: txProcessing } = useWaitForTransaction({
    hash: tx?.hash,
    onSuccess: () => {
      toast.update(toastId.current!, {
        render: TRADE_DATA[side].successMsg,
        isLoading: false,
        type: "success",
        autoClose: 3000
      });
      successFn && successFn();
    }
  });

  return { isLoading: isLoading || txProcessing, executeTx: writeAsync };
};
