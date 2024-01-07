import { useGetComments } from "@/hooks/useCommentApi";
import { ChatBubbleOutline } from "@mui/icons-material";
import { IconButton } from "@mui/joy";
import { FC, useState } from "react";
import { CreateEditCommentModal } from "../app/[wallet]/create-edit-comment-modal";

interface Props {
  questionId: number;
}

export const AddCommentButton: FC<Props> = ({ questionId }) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const { refetch: refetchComments } = useGetComments(questionId);
  return (
    <>
      {isCommentModalOpen && (
        <CreateEditCommentModal
          close={() => setIsCommentModalOpen(false)}
          questionId={questionId}
          refetch={refetchComments}
        />
      )}
      <IconButton onClick={() => setIsCommentModalOpen(true)}>
        <ChatBubbleOutline fontSize="small" />
      </IconButton>
    </>
  );
};
