import { OpenDialog } from "@/contexts/DialogContainer";
import { useUserContext } from "@/contexts/userContext";
import { useDeleteReply, useGetQuestion, useGetQuestionsFromUser } from "@/hooks/useQuestionsApi";
import { DeleteOutline, EditOutlined, MoreHoriz } from "@mui/icons-material";
import { Box, CircularProgress, Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC } from "react";

interface Props {
  question:
    | NonNullable<ReturnType<typeof useGetQuestionsFromUser>["data"]>[number]
    | NonNullable<ReturnType<typeof useGetQuestion>["data"]>;
  refetchQuestion: () => void;
  onEdit: () => void;
}

export const ReplyContextMenu: FC<Props> = ({ question, refetchQuestion, onEdit }) => {
  const { user } = useUserContext();
  const deleteReply = useDeleteReply();
  const isEditable = question.replierId === user?.id;

  const handleDelete = async () => {
    OpenDialog({
      type: "confirm",
      submit: () =>
        deleteReply.mutateAsync(question.id).then(() => {
          refetchQuestion();
        }),
      body: "Are you sure you want to delete this reply ?",
      title: "Delete reply"
    });
  };

  return (
    <Box sx={{ display: isEditable ? undefined : "none" }}>
      <Dropdown>
        <MenuButton variant="plain">
          <MoreHoriz />
        </MenuButton>
        <Menu>
          <MenuItem onClick={() => onEdit()}>
            <ListItemDecorator>
              <EditOutlined />
            </ListItemDecorator>
            Edit
          </MenuItem>
          <MenuItem disabled={deleteReply.isLoading} color="danger" onClick={handleDelete}>
            <ListItemDecorator>{deleteReply.isLoading ? <CircularProgress /> : <DeleteOutline />}</ListItemDecorator>
            Delete
          </MenuItem>
        </Menu>
      </Dropdown>
    </Box>
  );
};
