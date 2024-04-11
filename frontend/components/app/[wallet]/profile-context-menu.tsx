import { useUserProfile } from "@/hooks/useUserProfile";
import { shortAddress } from "@/lib/utils";
import FileUploadOutlined from "@mui/icons-material/FileUploadOutlined";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { Dropdown, ListItemDecorator, Menu, MenuButton, MenuItem } from "@mui/joy";
import { FC, ReactNode } from "react";
import { toast } from "react-toastify";

interface Props {
  profile: ReturnType<typeof useUserProfile>["user"];
}
export const ProfileContextMenu: FC<Props> = ({ profile }): ReactNode => {
  const userName = profile?.displayName || shortAddress(profile?.wallet);
  const handleShare = async () => {
    const url = `${location.origin}/profile/${profile?.wallet}`;
    if (navigator.share) {
      navigator.share({
        title: `${userName} || builderfi`,
        text: `Check ${profile?.displayName}'s profile on builder.fi`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("profile url copied to clipboard");
    }
  };
  return (
    <Dropdown>
      <MenuButton sx={{ minHeight: "0px" }} variant="plain">
        <MoreHoriz />
      </MenuButton>
      <Menu>
        <MenuItem onClick={handleShare}>
          <ListItemDecorator>
            <FileUploadOutlined />
          </ListItemDecorator>
          Share {userName} profile
        </MenuItem>
      </Menu>
    </Dropdown>
  );
};
