import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { shortAddress } from "@/lib/utils";
import { Avatar, Chip, Skeleton, Typography } from "@mui/joy";
import { SxProps, TypographySystem } from "@mui/joy/styles/types";
import { User } from "@prisma/client";
import { FC, useMemo } from "react";
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
    label?: "answer" | "question";
  };

  //Type 3: Joined and replies/questions
  joinedAndReplies?: {
    createdAt: Date;
    numberOfQuestions: number;
    numberOfReplies: number;
  };

  //Type 4: number of holders and keys owned
  holdersAndKeys?: {
    ownedKeys: number;
    numberOfHolders: number;
  };

  //Type 5: number of holders and answers
  holdersAndAnswers?: {
    numberOfHolders: number;
    numberOfAnswers: number;
  };

  //Style
  sx?: SxProps;
  nameLevel?: keyof TypographySystem;

  //Interactivity
  onClick?: () => void;
  nonClickable?: boolean;
}

const pluralize = (word: string, amount: number) => {
  return amount <= 1 ? word : `${word}s`;
};

export const UnifiedUserItem: FC<Props> = ({
  user,
  isLoading,
  holderInfo,
  holdersAndReplies,
  holdersAndAnswers,
  sx,
  onClick,
  nonClickable,
  nameLevel,
  joinedAndReplies,
  holdersAndKeys
}) => {
  const router = useBetterRouter();
  const { holding, holders } = useUserContext();

  const goToProfile = () => {
    router.push(`/profile/${user?.wallet}`);
  };

  const renderSubtitle = () => {
    if (holdersAndReplies) {
      return `${holdersAndReplies.numberOfHolders} ${pluralize("holder", holdersAndReplies.numberOfHolders)} • ${
        holdersAndReplies.numberOfReplies
      }/${holdersAndReplies.numberOfQuestions} ${pluralize(
        holdersAndReplies.label || "answer",
        holdersAndReplies.numberOfQuestions
      )}`;
    }

    if (holderInfo) {
      const nbrKeys = `${holderInfo.numberOfKeys} ${pluralize("key", holderInfo.numberOfKeys)}`;
      const holderNum = holderInfo.holderNumber ? `• Holder #${holderInfo.holderNumber}` : "";
      return nbrKeys + " " + holderNum;
    }

    if (joinedAndReplies) {
      return `${user?.bio ? `${user.bio.substring(0, 60)}... • ` : ""}${joinedAndReplies.numberOfQuestions}/${
        joinedAndReplies.numberOfReplies
      } ${pluralize("answer", joinedAndReplies.numberOfReplies)}`;
    }

    if (holdersAndKeys) {
      return `${holdersAndKeys.numberOfHolders} ${pluralize("holder", holdersAndKeys.numberOfHolders)} • ${
        holdersAndKeys.ownedKeys
      } ${pluralize("key", holdersAndKeys.ownedKeys)} owned`;
    }
    if (holdersAndAnswers) {
      return `${holdersAndAnswers.numberOfHolders} ${pluralize("holder", holdersAndAnswers.numberOfHolders)} • ${
        holdersAndAnswers.numberOfAnswers
      } ${pluralize("answer", holdersAndAnswers.numberOfAnswers)}`;
    }
  };

  const { isHolder, isHeld } = useMemo(() => {
    const isHolder = holding?.find(holding => holding.ownerId === user?.id) ? true : false;
    const isHeld = holders?.find(holder => holder.holderId === user?.id) ? true : false;
    return { isHolder, isHeld };
  }, [holding, holders, user?.id]);

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
          <Flex x gap1>
            <Typography
              onClick={goToProfile}
              textColor={"neutral.800"}
              fontWeight={600}
              sx={{ cursor: "pointer" }}
              level={nameLevel ? nameLevel : "body-sm"}
            >
              <Skeleton loading={isLoading || false}>{user?.displayName || shortAddress(user?.wallet || "")}</Skeleton>
            </Typography>
            {(isHolder || isHeld) && (
              <Chip size="sm" variant="outlined">
                {isHolder && isHeld ? "Mutual" : isHolder ? "Holding" : "Holder"}
              </Chip>
            )}
          </Flex>
          <Typography textColor={"neutral.600"} level="body-sm">
            {renderSubtitle()}
          </Typography>
        </Flex>
      </Flex>
      {/* {!hideChevron && !nonClickable && <ChevronRight />} */}
    </Flex>
  );
};
