import { useBetterRouter } from "@/hooks/useBetterRouter";
import { Avatar, AvatarProps } from "@mui/joy";
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
      sx={{ cursor: "pointer", ...props.sx }}
      {...props}
    />
  );
};
