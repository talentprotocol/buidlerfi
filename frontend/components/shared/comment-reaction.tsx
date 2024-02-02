import { useUserContext } from "@/contexts/userContext";
import { useAddCommentReaction, useGetCommentReactions } from "@/hooks/useCommentApi";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton, Typography, useTheme } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { FC, useMemo } from "react";
import { Flex } from "./flex";

interface Props {
  sx?: SxProps;
  commentId: number;
  isReadOnly?: boolean;
}

export const CommentReactions: FC<Props> = ({ commentId, sx, isReadOnly }) => {
  const { user } = useUserContext();
  const theme = useTheme();
  const addCommentReaction = useAddCommentReaction();
  const { data: reactions, refetch: refetchReactions } = useGetCommentReactions(commentId);

  const handleAddReaction = async () => {
    await addCommentReaction.mutateAsync(commentId);
    refetchReactions();
  };

  const hasLiked = useMemo(() => {
    return !!reactions?.find(react => react.userId === user?.id);
  }, [reactions, user?.id]);

  return (
    <Flex x yc ml={4} sx={sx}>
      {isReadOnly ? (
        <Flex m={1}>
          <FavoriteBorder fontSize="small" htmlColor={theme.palette.neutral[600]} />
        </Flex>
      ) : (
        <IconButton variant="plain" onClick={handleAddReaction}>
          {hasLiked ? (
            <Favorite fontSize="small" htmlColor={theme.palette.primary[500]} />
          ) : (
            <FavoriteBorder fontSize="small" htmlColor={theme.palette.neutral[600]} />
          )}
        </IconButton>
      )}

      <Typography level="body-sm">{reactions?.length || 0}</Typography>
    </Flex>
  );
};
