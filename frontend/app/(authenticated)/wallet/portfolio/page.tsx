"use client";

import { KeyIcon } from "@/components/icons/key";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useGetHoldings } from "@/hooks/useBuilderFiApi";
import { useUsdPrice } from "@/hooks/useUsdPrice";
import { formatToDisplayString, tryParseBigInt } from "@/lib/utils";
import { Typography } from "@mui/joy";
import { useMemo } from "react";

export default function PortfolioPage() {
  const { user } = useUserContext();
  const { data: allHolding } = useGetHoldings(user?.wallet as `0x${string}`);

  const portfolio = useMemo(() => {
    if (!allHolding) return BigInt(0);
    const holding = allHolding.reduce((prev, curr) => prev + tryParseBigInt(curr.owner.sellPrice), BigInt(0));
    return holding;
  }, [allHolding]);

  const { formattedString } = useUsdPrice({ ethAmountInWei: portfolio });

  return (
    <Flex y grow component="main" gap1 p={2}>
      <InjectTopBar withBack title="Portfolio" />
      <Flex x yc gap1>
        <Flex
          y
          xc
          yc
          width="40px"
          height="40px"
          borderRadius="20px"
          sx={{ backgroundColor: theme => theme.palette.primary.softBg }}
        >
          <KeyIcon fontSize="xl" sx={{ color: theme => theme.palette.primary[400] }} />
        </Flex>
        <Flex y>
          <Typography className="remove-text-transform" level="h4">
            {formatToDisplayString(portfolio, 18, 5)} ETH
          </Typography>
          <Typography level="body-sm">${formattedString}</Typography>
        </Flex>
      </Flex>
    </Flex>
  );
}
