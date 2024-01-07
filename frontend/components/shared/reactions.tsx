import { useUserContext } from "@/contexts/userContext";
import { useAddReaction, useDeleteReaction, useGetReactions } from "@/hooks/useQuestionsApi";
import { ArrowDownward, ArrowUpward, Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton, Typography, useTheme } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { ReactionType } from "@prisma/client";
import { FC, MouseEvent, useMemo } from "react";
import { Flex } from "./flex";

interface Props {
  questionId: number;
  type?: "like" | "upvote";
  sx?: SxProps;
}

export const Reactions: FC<Props> = ({ questionId, type = "upvote", sx }) => {
  const { user } = useUserContext();
  const theme = useTheme();

  const { data: reactions, refetch: refetchReactions } = useGetReactions(questionId, type);
  const deleteReaction = useDeleteReaction();
  const addReaction = useAddReaction();

  const myVote = useMemo(() => {
    const found = reactions?.find(react => react.userId === user?.id && react.questionId);
    if (found) return found.reactionType;
  }, [reactions, user?.id]);

  const upvotes = useMemo(
    () => reactions?.reduce((prev, curr) => (curr.reactionType === "UPVOTE" ? prev + 1 : prev - 1), 0),
    [reactions]
  );

  const hasLikedReply = useMemo(() => {
    return !!reactions?.find(
      react => react.userId === user?.id && react.reactionType === "LIKE" && react.replyId === questionId
    );
  }, [questionId, reactions, user?.id]);

  const handleAddReaction = async (e: MouseEvent<HTMLAnchorElement>, reaction: ReactionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (myVote === reaction || (reaction === "LIKE" && hasLikedReply))
      await deleteReaction.mutateAsync({ questionId: questionId, reactionType: reaction });
    else await addReaction.mutateAsync({ questionId: questionId, reactionType: reaction });
    refetchReactions();
  };

  const likes = useMemo(() => reactions?.length, [reactions?.length]);

  if (type === "like") {
    return (
      <Flex x yc ml={4} sx={sx}>
        <IconButton onClick={e => handleAddReaction(e, "LIKE")} variant="plain">
          {hasLikedReply ? (
            <Favorite htmlColor={theme.palette.primary[500]} fontSize="small" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>
        <Typography level="body-sm">{likes}</Typography>
      </Flex>
    );
  }

  return (
    <Flex x yc xsb sx={sx}>
      <Flex x yc gap={0.5}>
        <IconButton onClick={e => handleAddReaction(e, "UPVOTE")} color={myVote === "UPVOTE" ? "primary" : undefined}>
          <ArrowUpward fontSize="small" />
        </IconButton>
        <Typography
          textColor={!myVote ? undefined : myVote === "UPVOTE" ? "primary.500" : "danger.500"}
          level="body-sm"
          textAlign="center"
          sx={{ minWidth: "35px" }}
        >
          {upvotes}
        </Typography>
        <IconButton
          onClick={e => handleAddReaction(e, "DOWNVOTE")}
          color={myVote === "DOWNVOTE" ? "danger" : undefined}
        >
          <ArrowDownward fontSize="small" />
        </IconButton>
      </Flex>
    </Flex>
  );
};
