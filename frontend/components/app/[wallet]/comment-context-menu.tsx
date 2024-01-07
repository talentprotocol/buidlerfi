import { OpenDialog } from "@/contexts/DialogContainer";
import { useDeleteComment, useGetComments } from "@/hooks/useCommentApi";
import { DeleteOutline, EditOutlined, MoreHoriz } from "@mui/icons-material";
import { Box, CircularProgress, Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC, useState } from "react";
import { CreateEditCommentModal } from "./create-edit-comment-modal";

interface Props {
  questionId: number;
  comment: NonNullable<ReturnType<typeof useGetComments>["data"]>[number];
}

export const CommentContextMenu: FC<Props> = ({ comment, questionId }) => {
  const deleteComment = useDeleteComment();
  const { refetch } = useGetComments(comment.questionId);
  const [isEdittingModalOpen, setIsEdittingModalOpen] = useState(false);

  const handleDelete = async () => {
    OpenDialog({
      type: "confirm",
      submit: () =>
        deleteComment.mutateAsync(comment.id).then(() => {
          refetch();
        }),
      body: "Are you sure you want to delete this comment ?",
      title: "Delete comment"
    });
  };

  return (
    <Box sx={{ padding: "0" }}>
      {isEdittingModalOpen ? (
        <CreateEditCommentModal
          questionId={questionId}
          commentToEdit={comment}
          close={() => setIsEdittingModalOpen(false)}
          refetch={refetch}
        />
      ) : null}
      <Dropdown>
        <MenuButton variant="plain">
          <MoreHoriz />
        </MenuButton>

        <Menu>
          <MenuItem onClick={() => setIsEdittingModalOpen(true)}>
            <ListItemDecorator>
              <EditOutlined />
            </ListItemDecorator>
            Edit
          </MenuItem>

          <MenuItem disabled={deleteComment.isLoading} color="danger" onClick={handleDelete}>
            <ListItemDecorator>{deleteComment.isLoading ? <CircularProgress /> : <DeleteOutline />}</ListItemDecorator>
            Delete
          </MenuItem>
        </Menu>
      </Dropdown>
    </Box>
  );
};
