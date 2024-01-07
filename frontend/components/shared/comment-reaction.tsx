import { useUserContext } from "@/contexts/userContext";
import { useAddCommentReaction, useGetComments } from "@/hooks/useCommentApi";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton, Typography, useTheme } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { FC, useMemo } from "react";
import { Flex } from "./flex";

interface Props {
  sx?: SxProps;
  commentId: number;
  reactions: NonNullable<ReturnType<typeof useGetComments>["data"]>[number]["reactions"];
  refetch: () => void;
}

export const CommentReactions: FC<Props> = ({ commentId, sx, reactions, refetch }) => {
  const { user } = useUserContext();
  const theme = useTheme();
  const addCommentReaction = useAddCommentReaction();

  const handleAddReaction = async () => {
    await addCommentReaction.mutateAsync(commentId);
    refetch();
  };

  const hasLiked = useMemo(() => {
    return !!reactions?.find(react => react.userId === user?.id);
  }, [reactions, user?.id]);

  return (
    <Flex x yc ml={4} sx={sx}>
      <IconButton variant="plain" onClick={handleAddReaction}>
        {hasLiked ? (
          <Favorite fontSize="small" htmlColor={theme.palette.primary[500]} />
        ) : (
          <FavoriteBorder fontSize="small" />
        )}
      </IconButton>
      <Typography level="body-sm">{reactions.length}</Typography>
    </Flex>
  );
};
