"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { ChevronRight } from "@mui/icons-material";
import { Skeleton, Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { Flex } from "./flex";

interface Props {
  address: `0x${string}`;
  dappName: string;
}

export function AirstackUserItem({ address, dappName }: Props) {
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
        <Avatar size="sm" src={socialData.avatar}>
          <Skeleton loading={socialData.isLoading} />
        </Avatar>
        <Flex y gap={0.5}>
          <Typography textColor={"neutral.800"} fontWeight={600} level="body-sm">
            <Skeleton loading={socialData.isLoading}>{socialData.name}</Skeleton>
          </Typography>
          <Typography textColor={"neutral.500"} level="body-sm">
            {dappName}
          </Typography>
        </Flex>
      </Flex>
      <ChevronRight />
    </Flex>
  );
}
