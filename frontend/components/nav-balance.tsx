"use client";
import { useAccount, useBalance } from "wagmi";

export function NavBalance() {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address
  });

  if (balance) {
    return (
      <p className="">
        {parseFloat(balance?.formatted).toFixed(3)} {balance?.symbol}
      </p>
    );
  } else {
    return <></>;
  }
}
