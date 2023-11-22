"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { ChevronRight } from "@mui/icons-material";
import { Skeleton, Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { Flex } from "./flex";

interface Props {
  address: `0x${string}`;
  numberOfKeys?: number;
  holderNumber?: number;
}

export function HolderItem({ address, numberOfKeys, holderNumber }: Props) {
  const router = useRouter();

  const socialData = useSocialData(address);

  const keysPlural = () => {
    if (numberOfKeys != 1) {
      return "keys";
    } else {
      return "key";
    }
  };

  return (
    <Flex
      x
      xsb
      yc
      py={1}
      px={2}
      sx={{ cursor: "pointer", ":hover": { backgroundColor: "neutral.100" } }}
      onClick={() => router.push(`/profile/${address}`)}
    >
      <Flex x yc gap2>
        <Avatar size="sm" src={socialData.avatar}>
          <Skeleton loading={socialData.isLoading} />
        </Avatar>
        <Flex y gap={0.5}>
          <Typography textColor={"neutral.800"} fontWeight={600} level="body-sm">
            <Skeleton loading={socialData.isLoading}>{socialData.name}</Skeleton>
          </Typography>
          <Typography textColor={"neutral.600"} level="body-sm">
            {numberOfKeys} {keysPlural()} • Holder {`#${holderNumber}`}
          </Typography>
        </Flex>
      </Flex>
      <ChevronRight />
    </Flex>
  );
}
