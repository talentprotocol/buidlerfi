import { useUserContext } from "@/contexts/userContext";
import { useAddCommentReaction, useGetCommentReactions } from "@/hooks/useCommentApi";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import { useTheme } from "@mui/joy/styles/ThemeProvider";
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

  const isDisabled = !user?.privyUserId || isReadOnly;

  return (
    <Flex x yc ml={4} sx={sx}>
      <IconButton variant="plain" onClick={handleAddReaction} disabled={isDisabled}>
        {hasLiked ? (
          <Favorite fontSize="small" htmlColor={theme.palette.primary[500]} />
        ) : (
          <FavoriteBorder fontSize="small" htmlColor={isDisabled ? theme.palette.neutral[300] : undefined} />
        )}
      </IconButton>
      <Typography level="body-sm">{reactions?.length || 0}</Typography>
    </Flex>
  );
};
