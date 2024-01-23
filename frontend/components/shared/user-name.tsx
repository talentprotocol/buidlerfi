import { useBetterRouter } from "@/hooks/useBetterRouter";
import { shortAddress } from "@/lib/utils";
import { FC } from "react";

interface Props {
  user?: {
    displayName?: string | null;
    wallet: string;
  };
}

export const UserName: FC<Props> = ({ user }) => {
  const router = useBetterRouter();
  return (
    <span style={{ cursor: "pointer" }} onClick={() => router.push(`/profile/${user?.wallet}`)}>
      {user?.displayName || shortAddress(user?.wallet)}
    </span>
  );
};
