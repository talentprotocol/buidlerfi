import { useBetterRouter } from "@/hooks/useBetterRouter";
import Avatar from "@mui/joy/Avatar";
import { AvatarProps } from "@mui/joy/Avatar/AvatarProps";
import { FC } from "react";

interface Props extends AvatarProps {
  user?: {
    avatarUrl?: string | null;
    displayName?: string | null;
    wallet: string;
  };
}

export const UserAvatar: FC<Props> = ({ user, ...props }) => {
  const router = useBetterRouter();
  return (
    <Avatar
      src={user?.avatarUrl || undefined}
      alt={user?.displayName || undefined}
      onClick={() => user && router.push(`/profile/${user.wallet}`)}
      {...props}
      sx={{ cursor: "pointer", ...props.sx }}
    />
  );
};
