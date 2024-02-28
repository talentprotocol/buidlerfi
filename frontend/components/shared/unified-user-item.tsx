import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { getDifference, shortAddress } from "@/lib/utils";
import Avatar from "@mui/joy/Avatar";
import Chip from "@mui/joy/Chip";
import Skeleton from "@mui/joy/Skeleton";
import Typography from "@mui/joy/Typography";
import { SxProps, TypographySystem } from "@mui/joy/styles/types";
import { FC, useMemo } from "react";
import { Flex } from "./flex";

interface Props {
  user?: { displayName: string | null; wallet: string; avatarUrl: string | null; id: number };
  isLoading?: boolean;

  //Type 1: Holder info. (Holders and holding on wallet page)
  holderInfo?: {
    numberOfKeys: number;
    holderNumber?: number;
  };

  //Type 2: Holders and replies count. (Used in most places)
  holdersAndReplies?: {
    numberOfHolders: number;
    questionsCount: number;
    label?: "answer" | "question";
  };

  //Type 3: Joined and replies/questions
  joinedAndReplies?: {
    createdAt: Date;
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

  //Type 6: bio
  bio?: string;

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
  bio,
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
      return (
        <>
          <strong>{holdersAndReplies.numberOfHolders}</strong> {pluralize("holder", holdersAndReplies.numberOfHolders)}{" "}
          • <strong>{holdersAndReplies.questionsCount}</strong>{" "}
          {pluralize(holdersAndReplies.label || "answer", holdersAndReplies.questionsCount)}
        </>
      );
    }

    if (holderInfo) {
      return (
        <>
          <strong>{holderInfo.numberOfKeys}</strong> {pluralize("key", holderInfo.numberOfKeys)}
          {holderInfo.holderNumber && (
            <>
              <strong>{holderInfo.holderNumber}</strong> • Holder # {holderInfo.holderNumber}
            </>
          )}
        </>
      );
    }

    if (joinedAndReplies) {
      const diff = getDifference(joinedAndReplies.createdAt);
      return (
        <>
          Joined <strong>{diff}</strong> ago • <strong>{joinedAndReplies.numberOfReplies}</strong>{" "}
          {pluralize("answer", joinedAndReplies.numberOfReplies)}
        </>
      );
    }

    if (holdersAndKeys) {
      return (
        <>
          <strong>{holdersAndKeys.numberOfHolders}</strong> {pluralize("holder", holdersAndKeys.numberOfHolders)} •{" "}
          <strong>{holdersAndKeys.ownedKeys}</strong> {pluralize("key", holdersAndKeys.ownedKeys)} owned
        </>
      );
    }
    if (holdersAndAnswers) {
      return (
        <>
          <strong>{holdersAndAnswers.numberOfHolders}</strong> {pluralize("holder", holdersAndAnswers.numberOfHolders)}{" "}
          • <strong>{holdersAndAnswers.numberOfAnswers}</strong>{" "}
          {pluralize("answer", holdersAndAnswers.numberOfAnswers)}
        </>
      );
    }

    if (bio) {
      return bio;
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
      maxWidth="100%"
      py={1}
      px={2}
      sx={{
        cursor: nonClickable ? undefined : "pointer",
        ":hover": { backgroundColor: nonClickable ? undefined : "neutral.100" },
        ...sx
      }}
      onClick={onClick ? onClick : goToProfile}
    >
      <Flex x yc gap2 width="100%">
        <Avatar
          size="sm"
          src={user?.avatarUrl || undefined}
          alt={user?.displayName || shortAddress(user?.wallet || "")}
          sx={{ cursor: "pointer" }}
          onClick={goToProfile}
        ></Avatar>
        <Flex y gap={0.5} width="100%">
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
          <Typography
            textColor={"neutral.600"}
            level="body-sm"
            noWrap
            sx={{ textOverflow: "ellipsis", overflow: "hidden", maxWidth: "calc(100% - 50px)" }}
          >
            {renderSubtitle()}
          </Typography>
        </Flex>
      </Flex>
      {/* {!hideChevron && !nonClickable && <ChevronRight />} */}
    </Flex>
  );
};
