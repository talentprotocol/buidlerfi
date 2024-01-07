import { CommentReactions } from "@/components/shared/comment-reaction";
import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useGetComments } from "@/hooks/useCommentApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { formatText, getDifference } from "@/lib/utils";
import { Avatar, Typography } from "@mui/joy";
import router from "next/router";
import { FC, useMemo } from "react";
import { CommentContextMenu } from "./comment-context-menu";

interface Props {
  comment: NonNullable<ReturnType<typeof useGetComments>["data"]>[number];
  refetch: () => void;
}

export const CommentEntry: FC<Props> = ({ comment, refetch }) => {
  const { user: currentUser } = useUserContext();

  const commentContent = useMemo(() => formatText(comment.content), [comment]);

  return (
    <Flex x gap1>
      <Avatar
        size="sm"
        sx={{ cursor: "pointer" }}
        src={comment.author.avatarUrl ?? DEFAULT_PROFILE_PICTURE}
        alt={comment.author.displayName ?? "avatar"}
        onClick={() => router.push(`/profile/${comment.author?.wallet}`)}
      />

      <Flex y xs fullwidth>
        <Flex x xsb fullwidth sx={{ alignItems: "center" }}>
          <Flex gap={0.5}>
            <Typography
              sx={{ cursor: "pointer" }}
              onClick={() => router.push(`/profile/${comment.author?.wallet}`)}
              level="title-sm"
            >
              {comment.author.displayName}
            </Typography>
            <Typography level="body-sm"> • {getDifference(comment.createdAt)}</Typography>
          </Flex>
          <Flex>
            {currentUser?.id === comment.author.id ? (
              <CommentContextMenu questionId={comment.questionId} comment={comment} />
            ) : null}
          </Flex>
        </Flex>
        <Flex y xsa>
          <Typography fontWeight={300} level="body-sm" textColor={"neutral.800"}>
            <div className="remove-text-transform" dangerouslySetInnerHTML={{ __html: commentContent }} />
          </Typography>
          {comment.authorId === currentUser?.id && (
            <CommentReactions
              sx={{ margin: "0" }}
              commentId={comment.id}
              reactions={comment.reactions}
              refetch={refetch}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
