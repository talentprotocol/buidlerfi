import { useUserContext } from "@/contexts/userContext";
import { useAddReaction, useDeleteReaction, useGetQuestion } from "@/hooks/useQuestionsApi";
import { ArrowDownward, ArrowUpward, Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton, Typography, useTheme } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { ReactionType } from "@prisma/client";
import { FC, MouseEvent, useMemo } from "react";
import { Flex } from "./flex";

interface Props {
  question: ReturnType<typeof useGetQuestion>["data"];
  refetch: () => void;
  type?: "like" | "upvote";
  sx?: SxProps;
}

export const Reactions: FC<Props> = ({ question, refetch, type, sx }) => {
  const { user } = useUserContext();
  const theme = useTheme();

  const deleteReaction = useDeleteReaction();
  const addReaction = useAddReaction();

  const myVote = useMemo(() => {
    const found = question?.reactions.find(react => react.userId === user?.id && react.questionId);
    if (found) return found.reactionType;
  }, [question?.reactions, user?.id]);

  const upvotes = useMemo(
    () => question?.reactions.reduce((prev, curr) => (curr.reactionType === "UPVOTE" ? prev + 1 : prev - 1), 0),
    [question?.reactions]
  );

  const hasLikedReply = useMemo(() => {
    return !!question?.replyReactions.find(
      react => react.userId === user?.id && react.reactionType === "LIKE" && react.replyId === question?.id
    );
  }, [question?.id, question?.replyReactions, user?.id]);

  const handleAddReaction = async (e: MouseEvent<HTMLAnchorElement>, reaction: ReactionType) => {
    e.preventDefault();
    e.stopPropagation();
    if (myVote === reaction || (reaction === "LIKE" && hasLikedReply))
      await deleteReaction.mutateAsync({ questionId: question!.id, reactionType: reaction });
    else await addReaction.mutateAsync({ questionId: question!.id, reactionType: reaction });

    refetch();
  };

  const likes = useMemo(() => question?.replyReactions.length, [question?.replyReactions.length]);

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
        <Typography textColor={myVote && "primary.500"} level="body-sm">
          {upvotes}
        </Typography>
        <IconButton
          onClick={e => handleAddReaction(e, "DOWNVOTE")}
          color={myVote === "DOWNVOTE" ? "primary" : undefined}
        >
          <ArrowDownward fontSize="small" />
        </IconButton>
      </Flex>
    </Flex>
  );
};
