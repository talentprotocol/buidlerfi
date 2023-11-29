"use client";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { getDifference, shortAddress } from "@/lib/utils";
import { ChevronRight } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import Avatar from "@mui/joy/Avatar";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { Flex } from "./flex";

interface RecommendedUserItemProps {
  wallet: string;
  avatarUrl?: string;
  ens?: string;
  lens?: string;
  farcaster?: string;
  talentProtocol?: string;
  replies: number;
  questions: number;
  createdAt?: Date;
  userId?: number;
}

export const RecommendedUserItem: FC<RecommendedUserItemProps> = ({
  wallet,
  avatarUrl = "",
  ens,
  lens,
  farcaster,
  talentProtocol,
  replies,
  questions,
  createdAt,
  userId
}) => {
  const displayName = () => talentProtocol || farcaster || ens || lens || shortAddress(wallet || "");
  return (
    <UserItemInner
      address={wallet}
      avatar={avatarUrl}
      name={displayName()}
      createdAt={createdAt}
      userId={userId}
      replies={replies}
      questions={questions}
    />
  );
};

interface UserItemInnerProps {
  address: string;
  avatar?: string;
  name: string;
  userId?: number;
  createdAt?: Date;
  replies: number;
  questions: number;
  px?: number;
  py?: number;
  isButton?: boolean;
}

const UserItemInner: FC<UserItemInnerProps> = ({
  address,
  avatar,
  name,
  userId,
  createdAt,
  replies,
  questions,
  px = 2,
  py = 1,
  isButton = true
}) => {
  const router = useRouter();
  const joinedAt = useMemo(() => getDifference(createdAt), [createdAt]);
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
          alt={name}
        />
        <Flex y>
          <Typography
            textColor={"neutral.800"}
            fontWeight={600}
            level={"body-sm"}
            sx={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${address}`)}
          >
            {name}
          </Typography>
          {userId !== undefined && userId > 0 ? (
            <Typography textColor={"neutral.600"} level="body-sm">
              Joined builder.fi {joinedAt} ago • {replies}/{questions} answers
            </Typography>
          ) : (
            <Typography textColor={"neutral.600"} level="body-sm">
              Not yet on builder.fi
            </Typography>
          )}
        </Flex>
      </Flex>
      {isButton && <ChevronRight />}
    </Flex>
  );
};
