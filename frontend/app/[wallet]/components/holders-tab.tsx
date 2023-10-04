"use client";
import { Icons } from "@/components/ui/icons";
import { UserItem } from "@/components/user-item";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { useMemo } from "react";

export function HoldersTab({ wallet }: { wallet: string }) {
  const { data: builderFiData, isLoading } = useBuilderFIData();

  const holders = useMemo(
    () =>
      builderFiData?.shareRelationships
        .filter(item => {
          return item.owner.id == wallet?.toLowerCase() && item.heldKeyNumber > 0;
        })
        .map(item => item.holder) || [],
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
      {holders.map(holder => (
        <UserItem
          address={holder.owner as `0x${string}`}
          buyPrice={holder.buyPrice}
          numberOfHolders={holder.numberOfHolders}
          key={`home-${holder.owner}`}
        />
      ))}
    </>
  );
}
