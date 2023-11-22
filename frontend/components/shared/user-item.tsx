"use client";
import { UserWithOnchainData } from "@/hooks/useBuilderFiApi";
import { useSocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { formatToDisplayString, shortAddress } from "@/lib/utils";
import { ChevronRight } from "@mui/icons-material";
import { Skeleton, Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Flex } from "./flex";

export const UserItem: FC<{ user: UserWithOnchainData }> = ({ user }) => {
  return (
    <UserItemInner
      address={user.wallet}
      avatar={user.avatarUrl || DEFAULT_PROFILE_PICTURE}
      name={user.displayName || shortAddress(user.wallet)}
      buyPrice={BigInt(user.buyPrice)}
      numberOfHolders={Number(user.numberOfHolders)}
    />
  );
};

interface Props {
  address: `0x${string}`;
  numberOfHolders?: number;
  buyPrice?: bigint;
}

export const UserItemFromAddress: FC<Props> = ({ address, numberOfHolders, buyPrice }) => {
  const socialData = useSocialData(address);

  return (
    <UserItemInner
      address={socialData.address}
      avatar={socialData.avatar}
      buyPrice={buyPrice}
      isLoading={socialData.isLoading}
      name={socialData.name}
      numberOfHolders={numberOfHolders}
    />
  );
};

interface UserItemInnerProps {
  address: string;
  avatar: string;
  name: string;
  isLoading?: boolean;
  buyPrice?: bigint;
  numberOfHolders?: number;
}

export const UserItemInner: FC<UserItemInnerProps> = ({
  address,
  avatar,
  name,
  isLoading = false,
  buyPrice,
  numberOfHolders
}) => {
  const router = useRouter();
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
        <Avatar size="sm" src={avatar}>
          <Skeleton loading={isLoading} />
        </Avatar>
        <Flex y gap={0.5}>
          <Typography textColor={"neutral.800"} fontWeight={600} level="body-sm">
            <Skeleton loading={isLoading}>{name}</Skeleton>
          </Typography>
          {numberOfHolders !== undefined && buyPrice !== undefined && (
            <Typography textColor={"neutral.600"} level="body-sm">
              {numberOfHolders.toString()} holders • Price {formatToDisplayString(buyPrice, 18)} ETH
            </Typography>
          )}
        </Flex>
      </Flex>
      <ChevronRight />
    </Flex>
  );
};
