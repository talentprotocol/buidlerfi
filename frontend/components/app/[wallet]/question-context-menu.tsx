import { useProfileContext } from "@/contexts/profileContext";
import { useUserContext } from "@/contexts/userContext";
import { useGetQuestions } from "@/hooks/useQuestionsApi";
import { DeleteOutline, EditOutlined, FileUploadOutlined, MoreHoriz } from "@mui/icons-material";
import { Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC } from "react";

interface Props {
  question?: NonNullable<ReturnType<typeof useGetQuestions>["data"]>[number];
}

export const QuestionContextMenu: FC<Props> = ({ question }) => {
  const {} = useProfileContext();
  const { user } = useUserContext();
  const isQuestionAsker = question?.questionerId === user?.id;
  return (
    <Dropdown>
      <MenuButton variant="plain">
        <MoreHoriz />
      </MenuButton>
      <Menu>
        {isQuestionAsker && (
          <MenuItem>
            <ListItemDecorator>
              <EditOutlined />
            </ListItemDecorator>
            Edit
          </MenuItem>
        )}
        <MenuItem>
          <ListItemDecorator>
            <FileUploadOutlined />
          </ListItemDecorator>
          Share
        </MenuItem>
        {isQuestionAsker && (
          <MenuItem color="danger">
            <ListItemDecorator>
              <DeleteOutline />
            </ListItemDecorator>
            Delete
          </MenuItem>
        )}
      </Menu>
    </Dropdown>
  );
};
