"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { formatToDisplayString, shortAddress } from "@/lib/utils";
import { ChevronRight } from "@mui/icons-material";
import { Skeleton, Typography, TypographySystem } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Flex } from "./flex";

interface CommonProps {
  px?: number;
  py?: number;
  isButton?: boolean;
  nameLevel?: keyof TypographySystem;
}

interface UserItemProps extends CommonProps {
  user: {
    wallet: string;
    avatarUrl?: string;
    displayName?: string;
    isLoading?: boolean;
    buyPrice?: string | bigint;
    numberOfHolders?: string | number;
    questions?: number;
    replies?: number;
  };
}

export const UserItem: FC<UserItemProps> = ({ user, ...props }) => {
  return (
    <UserItemInner
      {...user}
      {...props}
      buyPrice={BigInt(user.buyPrice || "0")}
      numberOfHolders={Number(user.numberOfHolders)}
    />
  );
};

interface Props extends CommonProps {
  address: `0x${string}`;
  numberOfHolders?: number;
  buyPrice?: bigint;
}

export const UserItemFromAddress: FC<Props> = ({ address, numberOfHolders, buyPrice, ...props }) => {
  const socialData = useSocialData(address);

  return <UserItemInner {...socialData} {...props} buyPrice={buyPrice} numberOfHolders={numberOfHolders} />;
};

interface UserItemInnerProps extends CommonProps {
  wallet: string;
  avatarUrl?: string;
  displayName?: string;
  isLoading?: boolean;
  buyPrice?: bigint;
  numberOfHolders?: number;
  questions?: number;
  replies?: number;
}

const UserItemInner: FC<UserItemInnerProps> = ({
  wallet: address,
  avatarUrl: avatar,
  displayName: name,
  isLoading = false,
  buyPrice,
  numberOfHolders,
  questions,
  replies,
  px = 2,
  py = 1,
  isButton = true,
  nameLevel = "body-sm"
}) => {
  const router = useRouter();

  const pluralize = (word: string, amount: number) => {
    return amount === 1 ? word : `${word}s`;
  };

  const renderDescription = () => {
    if (questions !== undefined && replies !== undefined) {
      if (numberOfHolders !== undefined) {
        return (
          <Typography textColor={"neutral.600"} level="body-sm">
            {numberOfHolders.toString()} {pluralize("holder", numberOfHolders)} • {replies}/{questions}{" "}
            {pluralize("answer", questions)}
          </Typography>
        );
      }
      return (
        <Typography textColor={"neutral.600"} level="body-sm">
          {replies}/{questions} {pluralize("answer", questions)}
        </Typography>
      );
    } else if (numberOfHolders !== undefined && buyPrice !== undefined) {
      return (
        <Typography textColor={"neutral.600"} level="body-sm">
          {numberOfHolders.toString()} {pluralize("holder", numberOfHolders)} • Price{" "}
          {formatToDisplayString(buyPrice, 18)} ETH
        </Typography>
      );
    }
    return null;
  };

  return (
    <Flex
      x
      xsb
      yc
      py={py}
      px={px}
      sx={{
        cursor: isButton ? "pointer" : undefined,
        ":hover": { backgroundColor: isButton ? "neutral.100" : undefined }
      }}
      onClick={isButton ? () => router.push(`/profile/${address}`) : undefined}
    >
      <Flex x yc gap2>
        <Avatar
          size="sm"
          src={avatar || DEFAULT_PROFILE_PICTURE}
          sx={{ cursor: "pointer" }}
          onClick={() => router.push(`/profile/${address}`)}
          alt={name || shortAddress(address || "")}
        />
        <Flex y>
          <Typography
            textColor={"neutral.800"}
            fontWeight={600}
            level={nameLevel}
            sx={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${address}`)}
          >
            <Skeleton loading={isLoading}>{name || shortAddress(address || "")}</Skeleton>
          </Typography>
          {renderDescription()}
        </Flex>
      </Flex>
      {isButton && <ChevronRight />}
    </Flex>
  );
};
