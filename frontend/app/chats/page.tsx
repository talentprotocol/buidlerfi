"use client";
import { Flex } from "@/components/flex";
import { Icons } from "@/components/ui/icons";
import { UserItem } from "@/components/user-item";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { Card, Typography } from "@mui/joy";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export default function ChatsPage() {
  const { address } = useAccount();
  const { data: builderFiData, isLoading } = useBuilderFIData();

  const [portfolio, holding, tradingFees] = useMemo(() => {
    const allHolders =
      builderFiData?.shareRelationships.filter(item => {
        return item.holder.id == address?.toLowerCase() && item.heldKeyNumber > 0;
      }) || [];

    return [
      allHolders.reduce((prev, curr) => prev + BigInt(curr.owner.buyPrice), BigInt(0)),
      allHolders.map(item => item.owner),
      builderFiData?.shareParticipants.find(user => user.owner == address?.toLowerCase())?.tradingFeesAmount
    ];
  }, [address, builderFiData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full mt-24">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <main className="pt-4 px-2 pb-16">
      <div className="grid gap-4 grid-cols-2 mb-6">
        <Flex component={Card}>
          <Typography level={"body-lg"}>Portfolio Value</Typography>
          <Typography>{formatUnits(portfolio, 18)} ETH</Typography>
        </Flex>
        <Flex component={Card}>
          <Typography level={"body-lg"}>Trading fees</Typography>
          <Typography>{!tradingFees ? "undefined" : formatUnits(tradingFees, 18)} ETH</Typography>
        </Flex>
      </div>
      {holding.map(item => (
        <UserItem
          address={item.owner as `0x${string}`}
          buyPrice={item.buyPrice}
          numberOfHolders={item.numberOfHolders}
          key={`home-${item.owner}`}
        />
      ))}
    </main>
  );
}
