import { Avatar, AvatarGroup } from "@mui/joy";
import { useRouter } from "next/navigation";

interface SimpleUser {
  avatarUrl: string | null;
  wallet: string;
  displayName: string | null;
}

export const UserGroupAvatars = ({ user1, user2 }: { user1?: SimpleUser; user2?: SimpleUser }) => {
  const router = useRouter();
  return (
    <AvatarGroup>
      <Avatar
        sx={{ width: "40px", height: "40px", cursor: "pointer" }}
        src={user1?.avatarUrl || ""}
        onClick={() => router.push(`/profile/${user1?.wallet}`)}
      />
      {user2 !== undefined && (
        <Avatar
          sx={{ width: "40px", height: "40px", cursor: "pointer" }}
          src={user2?.avatarUrl || ""}
          onClick={() => router.push(`/profile/${user2?.wallet}`)}
        />
      )}
    </AvatarGroup>
  );
};
