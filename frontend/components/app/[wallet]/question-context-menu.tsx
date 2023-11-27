import { DeleteOutline, EditOutlined, FileUploadOutlined, MoreHoriz } from "@mui/icons-material";
import { Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";

export const QuestionContextMenu = () => {
  return (
    <Dropdown>
      <MenuButton variant="plain">
        <MoreHoriz />
      </MenuButton>
      <Menu>
        <MenuItem>
          <ListItemDecorator>
            <EditOutlined />
          </ListItemDecorator>
          Edit
        </MenuItem>
        <MenuItem>
          <ListItemDecorator>
            <FileUploadOutlined />
          </ListItemDecorator>
          Share
        </MenuItem>
        <MenuItem color="danger">
          <ListItemDecorator>
            <DeleteOutline />
          </ListItemDecorator>
          Delete
        </MenuItem>
      </Menu>
    </Dropdown>
  );
};
