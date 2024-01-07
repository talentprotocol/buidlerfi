import { Flex } from "@/components/shared/flex";
import { FullTextArea } from "@/components/shared/full-text-area";
import { useUserContext } from "@/contexts/userContext";
import { useCreateComment, useEditComment, useGetComments } from "@/hooks/useCommentApi";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import { Button, Modal, ModalDialog } from "@mui/joy";
import { FC, useState } from "react";

interface Props {
  commentToEdit?: NonNullable<ReturnType<typeof useGetComments>["data"]>[number];
  questionId: number;
  close: () => void;
  refetch: () => void;
}

export const CreateEditCommentModal: FC<Props> = ({ close, refetch, commentToEdit, questionId }) => {
  const { user: currentUser } = useUserContext();
  const [commentContent, setCommentContent] = useState(commentToEdit?.content || "");
  const editComment = useEditComment();
  const postComment = useCreateComment();
  const handleUpdateComment = async () => {
    if (commentToEdit) {
      await editComment
        .mutateAsync({
          commentId: commentToEdit.id,
          comment: commentContent
        })
        .then(() => {
          close();
          refetch();
        });
    }
  };

  const handleCreateComment = async () => {
    await postComment
      .mutateAsync({
        questionId,
        comment: commentContent
      })
      .then(() => {
        close();
        refetch();
      });
  };

  return (
    <Modal open={true} onClose={close}>
      <ModalDialog layout="center" sx={{ width: "min(100vw, 500px)", padding: 0, overflowY: "auto" }}>
        <Flex y gap2 p={2} grow>
          <FullTextArea
            placeholder="Comment"
            avatarUrl={currentUser?.avatarUrl || undefined}
            onChange={e => setCommentContent(e.target.value)}
            value={commentContent}
          />
          <Flex x xc fullwidth>
            <Button
              disabled={commentContent.length < 5 || commentContent.length > MAX_COMMENT_LENGTH}
              onClick={() => (commentToEdit?.id ? handleUpdateComment() : handleCreateComment())}
              fullWidth
            >
              {commentToEdit?.id ? "Update" : "Post"}
            </Button>
          </Flex>
        </Flex>
      </ModalDialog>
    </Modal>
  );
};
