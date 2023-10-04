"use client";
import { usePrevious } from "@/hooks/usePrevious";
import { usePutUser } from "@/hooks/useUserApi";
import { Web3Button } from "@web3modal/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

export function NavWeb3Button() {
  const { address } = useAccount();
  const putUser = usePutUser();
  const prevAddress = usePrevious(address);
  useEffect(() => {
    if (!address) return;

    if (!prevAddress || prevAddress !== address) {
      putUser.mutate(address);
    }
  }, [address, prevAddress, putUser]);
  return <Web3Button />;
}
