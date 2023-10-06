"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import { Flex } from "./flex";

interface Props {
  address: `0x${string}`;
  numberOfHolders: number;
  buyPrice: bigint;
}

export function UserItem({ address, numberOfHolders, buyPrice }: Props) {
  const router = useRouter();

  const socialData = useSocialData(address);

  return (
    <Flex
      x
      xsb
      yc
      px={{ xs: 0, sm: 2 }}
      py={1}
      sx={{ ":hover": { backgroundColor: "neutral.100" } }}
      className="transition-all cursor-pointer"
      onClick={() => router.push(`/${address}`)}
    >
      <Flex x yc gap2>
        <Avatar size="sm" src={socialData.avatar} />
        <Flex y gap={0.5}>
          <Typography fontWeight={700} level="body-sm">
            {socialData.name}
          </Typography>
          <Typography textColor={"neutral.500"} level="body-sm">
            {numberOfHolders.toString()} holders | Price {formatUnits(BigInt(buyPrice || 0), 18)} ETH
          </Typography>
        </Flex>
      </Flex>
      <ChevronRight className="h-4 w-4" />
    </Flex>
  );
}
