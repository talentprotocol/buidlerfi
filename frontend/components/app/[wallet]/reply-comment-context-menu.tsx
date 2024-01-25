import { OpenDialog } from "@/contexts/DialogContainer";
import { useUserContext } from "@/contexts/userContext";
import { useDeleteComment } from "@/hooks/useCommentApi";
import { useDeleteReply } from "@/hooks/useQuestionsApi";
import { DeleteOutline, EditOutlined, MoreHoriz } from "@mui/icons-material";
import { Box, CircularProgress, Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC, useState } from "react";
import { CreateEditCommentModal } from "./create-edit-comment-modal";

interface Props {
  id: number;
  authorId: number;
  refetch: () => void;
  type: "reply" | "comment";
  content?: string;
}

export const ReplyCommentContextMenu: FC<Props> = ({ id, authorId, type, refetch, content }) => {
  const { user } = useUserContext();
  const [isEditing, setIsEditing] = useState(false);
  const deleteReply = useDeleteReply();
  const deleteComment = useDeleteComment();
  const isEditable = authorId === user?.id;

  const deleteCommentOrReply = type === "reply" ? deleteReply : deleteComment;

  const handleDelete = async () => {
    OpenDialog({
      type: "confirm",
      submit: () =>
        deleteCommentOrReply.mutateAsync(id).then(() => {
          refetch();
        }),
      body: `Are you sure you want to delete this ${type === "reply" ? "answer" : "comment"}?`,
      title: `Delete ${type === "reply" ? "answer" : "comment"}`
    });
  };

  return (
    <>
      {isEditing && (
        <CreateEditCommentModal
          id={id}
          isEdit={true}
          type={type}
          close={() => setIsEditing(false)}
          refetch={refetch}
          editContent={content}
        />
      )}
      <Box sx={{ display: isEditable ? undefined : "none" }}>
        <Dropdown>
          <MenuButton sx={{ minHeight: "0px" }} variant="plain">
            <MoreHoriz />
          </MenuButton>
          <Menu>
            <MenuItem onClick={() => setIsEditing(true)}>
              <ListItemDecorator>
                <EditOutlined />
              </ListItemDecorator>
              Edit
            </MenuItem>
            <MenuItem disabled={deleteCommentOrReply.isLoading} color="danger" onClick={handleDelete}>
              <ListItemDecorator>
                {deleteCommentOrReply.isLoading ? <CircularProgress /> : <DeleteOutline />}
              </ListItemDecorator>
              Delete
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </>
  );
};
