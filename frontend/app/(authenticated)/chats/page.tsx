"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { Icons } from "@/components/shared/ui/icons";
import { UserItem } from "@/components/shared/user-item";
import { useBuilderFIData, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { tryParseBigInt } from "@/lib/utils";
import { CreditCard } from "@mui/icons-material";
import { Card, Typography } from "@mui/joy";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export default function ChatsPage() {
  const { address } = useAccount();
  const { data: builderFiData, isLoading } = useBuilderFIData();
  const { data: allHolding } = useGetHoldings(address);
  const [portfolio, tradingFees] = useMemo(() => {
    if (!allHolding || !builderFiData) return [BigInt(0), BigInt(0)];
    return [
      allHolding.reduce((prev, curr) => prev + tryParseBigInt(curr.owner.buyPrice), BigInt(0)),
      builderFiData.shareParticipants.find(user => user.owner == address?.toLowerCase())?.tradingFeesAmount
    ];
  }, [address, allHolding, builderFiData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full mt-24">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <Flex y grow gap3 component={"main"} pt={4} px={2} pb={16}>
      <Flex x gap3 ys>
        <Flex grow component={Card}>
          <Typography level={"body-lg"}>Holdings</Typography>
          <Typography>{formatUnits(portfolio, 18)} ETH</Typography>
        </Flex>
        <Flex grow component={Card}>
          <Typography level={"body-lg"}>Fees earned</Typography>
          <Typography>{formatUnits(tryParseBigInt(tradingFees), 18)} ETH</Typography>
        </Flex>
      </Flex>
      <Flex y grow>
        <Typography level="h4" textColor="neutral.600" mb={1}>
          Experts ({allHolding?.length})
        </Typography>
        {allHolding?.length === 0 ? (
          <PageMessage
            icon={<CreditCard />}
            text="Buy other people's cards to ask them a question and access all answers."
          />
        ) : (
          allHolding?.map(item => (
            <UserItem
              address={item.owner.owner as `0x${string}`}
              buyPrice={tryParseBigInt(item.owner.buyPrice)}
              numberOfHolders={Number(item.owner.numberOfHolders)}
              key={`home-${item.owner.owner}`}
            />
          ))
        )}
      </Flex>
    </Flex>
  );
}
