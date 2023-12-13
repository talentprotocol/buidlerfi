"use client";

import { FeesIcon } from "@/components/icons/fees";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { formatToDisplayString } from "@/lib/utils";
import { Typography } from "@mui/joy";
import { useMemo } from "react";

export default function FeesPage() {
  const { user } = useUserContext();
  const { data: builderFiData } = useBuilderFIData();
  const tradingFees = useMemo(() => {
    if (!builderFiData) return BigInt(0);
    const tradingFees = builderFiData.shareParticipants.find(
      u => u.owner == user?.wallet?.toLowerCase()
    )?.tradingFeesAmount;
    return tradingFees;
  }, [user?.wallet, builderFiData]);

  return (
    <Flex y grow component="main" gap1 p={2}>
      <InjectTopBar withBack title="Fees" />
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
          <FeesIcon fontSize="xl" sx={{ color: theme => theme.palette.primary[400] }} />
        </Flex>
        <Typography className="remove-text-transform" level="h4">
          {formatToDisplayString(tradingFees, 18, 5)} ETH
        </Typography>
      </Flex>
    </Flex>
  );
}
