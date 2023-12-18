import { shortAddress } from "@/lib/utils";
import { ChevronRight } from "@mui/icons-material";
import { Avatar, Skeleton, Typography } from "@mui/joy";
import { SxProps, TypographySystem } from "@mui/joy/styles/types";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { Flex } from "./flex";

interface Props {
  user?: User;
  isLoading?: boolean;

  //Type 1: Holder info. (Holders and holding on wallet page)
  holderInfo?: {
    numberOfKeys: number;
    holderNumber?: number;
  };

  //Type 2: Holders and replies count. (Used in most places)
  holdersAndReplies?: {
    numberOfHolders: number;
    numberOfQuestions: number;
    numberOfReplies: number;
  };

  //Style
  sx?: SxProps;
  hideChevron?: boolean;
  nameLevel?: keyof TypographySystem;

  //Interactivity
  onClick?: () => void;
  nonClickable?: boolean;
}

const pluralize = (word: string, amount: number) => {
  return amount === 1 ? word : `${word}s`;
};

export const UnifiedUserItem: FC<Props> = ({
  user,
  isLoading,
  holderInfo,
  holdersAndReplies,
  sx,
  onClick,
  nonClickable,
  hideChevron,
  nameLevel
}) => {
  const router = useRouter();

  const goToProfile = () => {
    router.push(`/profile/${user?.wallet}`);
  };

  const renderSubtitle = () => {
    if (holdersAndReplies) {
      return `${holdersAndReplies.numberOfHolders} ${pluralize("holder", holdersAndReplies.numberOfHolders)} • ${
        holdersAndReplies.numberOfReplies
      }/${holdersAndReplies.numberOfQuestions} ${pluralize("answer", holdersAndReplies.numberOfQuestions)}`;
    }

    if (holderInfo) {
      const nbrKeys = `${holderInfo.numberOfKeys} ${pluralize("key", holderInfo.numberOfKeys)}`;
      const holderNum = holderInfo.holderNumber ? `• Holder #${holderInfo.holderNumber}` : "";
      return nbrKeys + " " + holderNum;
    }
  };

  return (
    <Flex
      x
      xsb
      yc
      py={1}
      px={2}
      sx={{
        cursor: nonClickable ? undefined : "pointer",
        ":hover": { backgroundColor: nonClickable ? undefined : "neutral.100" },
        ...sx
      }}
      onClick={onClick ? onClick : goToProfile}
    >
      <Flex x yc gap2>
        <Avatar
          size="sm"
          src={user?.avatarUrl || undefined}
          alt={user?.displayName || shortAddress(user?.wallet || "")}
          sx={{ cursor: "pointer" }}
          onClick={goToProfile}
        ></Avatar>
        <Flex y gap={0.5}>
          <Typography
            onClick={goToProfile}
            textColor={"neutral.800"}
            fontWeight={600}
            sx={{ cursor: "pointer" }}
            level={nameLevel ? nameLevel : "body-sm"}
          >
            <Skeleton loading={isLoading || false}>{user?.displayName || shortAddress(user?.wallet || "")}</Skeleton>
          </Typography>
          <Typography textColor={"neutral.600"} level="body-sm">
            {renderSubtitle()}
          </Typography>
        </Flex>
      </Flex>
      {!hideChevron && !nonClickable && <ChevronRight />}
    </Flex>
  );
};
