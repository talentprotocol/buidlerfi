import { useGetComments } from "@/hooks/useCommentApi";
import { ChatBubbleOutline } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/joy";
import { FC, useState } from "react";
import { CreateEditCommentModal } from "../app/[wallet]/create-edit-comment-modal";
import { Flex } from "./flex";

interface Props {
  questionId: number;
  count: number;
}

export const AddCommentButton: FC<Props> = ({ questionId, count }) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const { refetch: refetchComments } = useGetComments(questionId);
  return (
    <>
      {isCommentModalOpen && (
        <CreateEditCommentModal
          close={() => setIsCommentModalOpen(false)}
          id={questionId}
          isEdit={false}
          type="comment"
          refetch={refetchComments}
        />
      )}
      <Flex yc x gap={0.5}>
        <Typography level="body-sm" textAlign="center">
          {count}
        </Typography>
        <IconButton onClick={() => setIsCommentModalOpen(true)}>
          <ChatBubbleOutline fontSize="small" />
        </IconButton>
      </Flex>
    </>
  );
};
