import { useGlobalContext } from "@/contexts/globalContext";
import { formatToDisplayString } from "@/lib/utils";
import { useMemo } from "react";
import { parseEther } from "viem";

//Input can be in wei unit or eth unit
export const useUsdPrice = ({
  ethAmountInWei,
  ethAmount
}: {
  ethAmountInWei?: bigint;
  ethAmount?: number | bigint;
}) => {
  const { ethPrice } = useGlobalContext();
  const ethWei = useMemo(() => {
    if (ethAmountInWei !== undefined) {
      return ethAmountInWei;
    }

    if (ethAmount !== undefined) {
      return parseEther(ethAmount.toString());
    }

    return BigInt(0);
  }, [ethAmount, ethAmountInWei]);

  return {
    bigint: BigInt(ethWei) * BigInt(ethPrice),
    formattedString: formatToDisplayString(BigInt(ethWei) * BigInt(ethPrice), 18, 2)
  };
};
