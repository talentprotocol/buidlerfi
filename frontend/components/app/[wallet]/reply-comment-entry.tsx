import { CommentReactions } from "@/components/shared/comment-reaction";
import { Flex } from "@/components/shared/flex";
import { Reactions } from "@/components/shared/reactions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useMarkdown } from "@/hooks/useMarkdown";
import { getDifference, shortAddress } from "@/lib/utils";
import Typography from "@mui/joy/Typography";
import { User } from "@prisma/client";
import { FC, useState } from "react";
import { ReplyCommentContextMenu } from "./reply-comment-context-menu";
import { TradeKeyModal } from "./trade-key-modal";

interface Props {
  type: "reply" | "comment";
  id: number;
  author: User;
  content: string;
  createdAt: Date;
  refetch: () => void;
}

export const ReplyCommentEntry: FC<Props> = ({ id, type, content, author, refetch, createdAt }) => {
  const { user: currentUser, refetch: refetchUserContext } = useUserContext();
  const router = useBetterRouter();
  const formattedContent = useMarkdown(content);
  const [isBuyingKey, setIsBuyingKey] = useState(false);

  return (
    <Flex sx={{ borderBottom: theme => "1px solid " + theme.palette.divider }} fullwidth>
      {isBuyingKey && (
        <TradeKeyModal
          keyOwner={author}
          supporterKeysCount={0}
          hasKeys={false}
          isFirstKey={false}
          side={"buy"}
          close={async () => {
            setIsBuyingKey(false);
            await Promise.allSettled([refetchUserContext(), refetch()]);
          }}
        />
      )}
      <Flex x gap1 p={2} fullwidth>
        <UserAvatar size="sm" user={author} />

        <Flex y xsb fullwidth>
          <Flex x xsb fullwidth sx={{ alignItems: "center", minHeight: "32px" }}>
            <Flex gap={0.5}>
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={() => router.push(`/profile/${author?.wallet}`)}
                level="title-sm"
              >
                {author.displayName || shortAddress(author.wallet)}
              </Typography>
              <Typography level="body-sm"> • {getDifference(createdAt)}</Typography>
            </Flex>
            {currentUser?.id === author.id ? (
              <ReplyCommentContextMenu authorId={author.id} id={id} type={type} refetch={refetch} content={content} />
            ) : null}
          </Flex>
          <Flex y xsa>
            {/* if content is empty, it means the answer is locked (open question)*/}
            {type === "comment" && content === "" ? (
              <Typography level="body-sm" textColor="neutral.500" py={0.5}>
                {author.displayName || shortAddress(author.wallet)}&apos;s answer is gated.{" "}
                <a style={{ cursor: "pointer" }} onClick={() => setIsBuyingKey(true)}>
                  reveal it, buying {author.displayName || shortAddress(author.wallet)}&apos;s key
                </a>
              </Typography>
            ) : (
              formattedContent
            )}
            {type === "reply" ? (
              <Reactions sx={{ ml: -1 }} type="like" questionId={id} />
            ) : (
              <CommentReactions isReadOnly={content === ""} sx={{ ml: -1 }} commentId={id} />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
