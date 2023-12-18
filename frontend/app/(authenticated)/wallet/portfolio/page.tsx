"use client";

import { KeyIcon } from "@/components/icons/key";
import { Flex } from "@/components/shared/flex";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useUserContext } from "@/contexts/userContext";
import { useGetHoldings } from "@/hooks/useBuilderFiApi";
import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
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

  const { data: holding, isLoading } = useGetKeyRelationships({
    orderBy: { amount: "desc" },
    where: { holderId: user?.id, amount: { gt: 0 } }
  });

  return (
    <Flex y grow component="main" gap1>
      <InjectTopBar withBack title="Portfolio" />
      <Flex x yc gap1 p={2}>
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
      <Flex y grow>
        <Typography px={2} fontWeight={600} level="body-sm">
          My keys
        </Typography>
        {isLoading ? (
          <LoadingPage />
        ) : !holding || holding?.length === 0 ? (
          <PageMessage
            icon={<KeyIcon />}
            title="You don't have any keys"
            text="This space is where you'll find all your expert key holdings."
          />
        ) : (
          holding?.map(key => (
            <UnifiedUserItem key={key.id} user={key.owner} holderInfo={{ numberOfKeys: Number(key.amount) }} />
          ))
        )}
      </Flex>
    </Flex>
  );
}
