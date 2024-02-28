import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { useUserContext } from "@/contexts/userContext";
import { useCreateComment, useEditComment } from "@/hooks/useCommentApi";
import { usePutQuestion } from "@/hooks/useQuestionsApi";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import { FC, useState } from "react";

interface Props {
  //questionId for reply and create comment. commentId for edit comment
  id: number;
  isEdit?: boolean;
  editContent?: string;
  close: () => void;
  refetch: () => void;
  type: "reply" | "comment";
}

export const CreateEditCommentModal: FC<Props> = ({ close, refetch, id, type, isEdit, editContent }) => {
  const { user: currentUser } = useUserContext();
  const [content, setContent] = useState(editContent || "");
  const editComment = useEditComment();
  const updateQuestion = usePutQuestion();
  const postComment = useCreateComment();

  const handleSubmit = async () => {
    if (type === "reply") {
      await updateQuestion.mutateAsync({ answerContent: content, id: id, isGated: undefined });
    } else {
      if (isEdit) {
        await editComment.mutateAsync({ commentId: id, comment: content });
      } else {
        await postComment.mutateAsync({ questionId: id, comment: content });
      }
    }

    close();
    refetch();
  };

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog layout="center" sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex y gap2 p={2} grow>
          <FullTextArea
            placeholder={type}
            avatarUrl={currentUser?.avatarUrl || undefined}
            onChange={e => setContent(e.target.value)}
            value={content}
          />
          <Flex x xc fullwidth>
            <Button
              disabled={content.length < 5 || content.length > MAX_COMMENT_LENGTH}
              loading={updateQuestion.isLoading || editComment.isLoading || postComment.isLoading}
              onClick={() => handleSubmit()}
              fullWidth
            >
              Submit
            </Button>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
