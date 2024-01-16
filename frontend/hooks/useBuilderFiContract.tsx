import { useStoreTransactionAction } from "@/hooks/useTransaction";
import { BUILDERFI_CONTRACT } from "@/lib/constants";
import { formatError, formatToDisplayString, shortAddress } from "@/lib/utils";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useContractRead } from "wagmi";
// import {prepareTransactionRequest} from "viem/actions";
import { useGlobalContext } from "@/contexts/globalContext";
import { useUserContext } from "@/contexts/userContext";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { User } from "@prisma/client";
import { UnsignedTransactionRequest, usePrivy } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";

export const useGetBuilderInfo = (address?: string) => {
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
    successMsg: "You sold a key !",
    header: (name: string) => `Sell a key from ${name}`,
    description: (priceString: string, priceStringUsd: string) =>
      `You will receive ${priceString} ETH ($${priceStringUsd})`,
    buttonText: "Complete sale",
    title: "Sale details",
    action: "Sell Key"
  },
  buy: {
    functionName: "buyShares",
    successMsg: "You bought a key !",
    header: (name: string) => `Buy a key from ${name}`,
    description: (priceString: string) => `Buying 1 key for ${priceString} ETH`,
    buttonText: "Complete purchase",
    title: "Purchase details",
    action: "Buy Key"
  }
} as const;

export const useTradeKey = (side: "buy" | "sell", keyOwner?: User, successFn?: () => void, errorFn?: () => void) => {
  const { user } = useUserContext();
  const { ethPrice } = useGlobalContext();
  const { sendTransaction } = usePrivy();
  const processTransaction = useStoreTransactionAction();
  const toastId = useRef<string | number | undefined>(undefined);

  //KeyPrice must be passed both for buy and sell.
  //It will not be sent to contract call for a sell, just used to display price in UI
  const tradeKey = useMutation(async (keyPrice: bigint) => {
    if (!user) {
      return;
    }
    const usdPrice = (BigInt(ethPrice) * BigInt(1e18) * keyPrice) / BigInt(1e18);
    try {
      const encodedData = encodeFunctionData({
        abi: BUILDERFI_CONTRACT.abi,
        functionName: TRADE_DATA[side].functionName,
        args: [user.wallet as `0x${string}`]
      });

      const unsignedTransaction: UnsignedTransactionRequest = {
        data: encodedData,
        value: side === "buy" ? keyPrice : 0n,
        to: BUILDERFI_CONTRACT.address
      };

      const res = await sendTransaction(unsignedTransaction, {
        buttonText: TRADE_DATA[side].buttonText,
        description: TRADE_DATA[side].description(formatToDisplayString(keyPrice), formatToDisplayString(usdPrice)),
        header: TRADE_DATA[side].header(keyOwner?.displayName || shortAddress(keyOwner?.wallet) || ""),
        transactionInfo: {
          action: TRADE_DATA[side].action,
          title: TRADE_DATA[side].title,
          contractInfo: {
            imgUrl: keyOwner?.avatarUrl || LOGO_BLUE_BACK
          }
        }
      });
      toastId.current = toast("Verifying transaction", { isLoading: true });

      const hash = await processTransaction.mutateAsync(res.transactionHash as `0x${string}`);
      if (hash && res.status === 1) {
        toast.update(toastId.current!, {
          render: TRADE_DATA[side].successMsg,
          isLoading: false,
          type: "success",
          autoClose: 3000
        });
        if (successFn) successFn();
      } else {
        throw new Error("Transaction reverted");
      }
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "shortMessage" in err &&
        err?.shortMessage !== "User rejected the request."
      ) {
        toast.update(toastId.current!, {
          render: "There was an error processing your transaction: " + formatError(err),
          isLoading: false,
          type: "error",
          autoClose: 3000
        });
        errorFn && errorFn();
      }
    }
  });

  return tradeKey;
};
