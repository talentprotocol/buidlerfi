"use client";
import { Icons } from "@/components/ui/icons";
import { UserItem } from "@/components/user-item";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { useMemo } from "react";

export function HoldingTab({ wallet }: { wallet: string }) {
  const { data: builderFiData, isLoading } = useBuilderFIData();

  const holding = useMemo(
    () =>
      builderFiData?.shareRelationships.filter(item => {
        return item.holder.id == wallet?.toLowerCase() && item.heldKeyNumber > 0;
      }) || [],
    [builderFiData?.shareRelationships, wallet]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full mt-24">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {holding.map(holdingItem => (
        <UserItem
          address={holdingItem.owner.owner as `0x${string}`}
          buyPrice={holdingItem.owner.buyPrice}
          numberOfHolders={holdingItem.owner.numberOfHolders}
          key={`home-${holdingItem.id}`}
        />
      ))}
    </>
  );
}
