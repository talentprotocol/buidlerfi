"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
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
    numberOfHolders?: string | number;
  };
}

export const UserItem: FC<UserItemProps> = ({ user, ...props }) => {
  return (
    <UserItemInner
      {...user}
      {...props}
      numberOfHolders={Number(user.numberOfHolders)}
      totalQuestions={user._count.questions}
      totalReplies={user._count.replies}
    />
  );
};

interface Props extends CommonProps {
  address: `0x${string}`;
  numberOfHolders?: number;
  totalQuestions?: number;
  totalReplies?: number;
}

export const UserItemFromAddress: FC<Props> = ({
  address,
  numberOfHolders,
  totalQuestions,
  totalReplies,
  ...props
}) => {
  const socialData = useSocialData(address);

  return (
    <UserItemInner
      {...socialData}
      {...props}
      numberOfHolders={numberOfHolders}
      totalQuestions={totalQuestions}
      totalReplies={totalReplies}
    />
  );
};

interface UserItemInnerProps extends CommonProps {
  wallet: string;
  avatarUrl?: string;
  displayName?: string;
  isLoading?: boolean;
  numberOfHolders?: number;
  totalQuestions?: number;
  totalReplies?: number;
}

export const UserItemInner: FC<UserItemInnerProps> = ({
  wallet: address,
  avatarUrl: avatar,
  displayName: name,
  isLoading = false,
  numberOfHolders,
  px = 2,
  py = 1,
  isButton = true,
  nameLevel = "body-sm",
  totalQuestions = 0,
  totalReplies = 0
}) => {
  const router = useRouter();

  const pluralHolders = () => (numberOfHolders === 1 ? "holder" : "holders");
  const pluralAnswers = () => (totalReplies === 1 ? "answer" : "answers");
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
            level={nameLevel}
            sx={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${address}`)}
          >
            <Skeleton loading={isLoading}>{name}</Skeleton>
          </Typography>
          {numberOfHolders !== undefined && numberOfHolders > 0 ? (
            <Typography textColor={"neutral.600"} level="body-sm">
              {numberOfHolders.toString()} {pluralHolders()} • {totalReplies}/{totalQuestions} {pluralAnswers()}
            </Typography>
          ) : (
            <Typography textColor={"neutral.600"} level="body-sm">
              Not on builder.fi yet
            </Typography>
          )}
        </Flex>
      </Flex>
      {isButton && <ChevronRight />}
    </Flex>
  );
};
