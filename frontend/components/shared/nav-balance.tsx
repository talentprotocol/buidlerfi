"use client";
import { useUserContext } from "@/contexts/userContext";
import { shortAddress } from "@/lib/utils";
import { Button, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance } from "wagmi";
import { Flex } from "./flex";

export function NavBalance() {
  const { address } = useUserContext();
  const { logout } = usePrivy();
  const { data: balance } = useBalance({
    address
  });

  return (
    <Flex x yc gap2>
      {balance && (
        <Typography>
          {parseFloat(balance?.formatted).toFixed(3)} {balance?.symbol}
        </Typography>
      )}
      {address && <Button onClick={logout}>{shortAddress(address)}</Button>}
    </Flex>
  );
}
