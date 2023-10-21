import { PeopleOutline } from "@mui/icons-material";
import { Link } from "@mui/joy";
import { MessageSquare, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Flex } from "./flex";

export function BottomNav() {
  const pathname = usePathname();
  const { address } = useAccount();

  return (
    <Flex x yc xsa component="nav" className={"fixed bottom-0 left-0 border-t w-full bg-white"}>
      <Link
        href="/"
        sx={{
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          backgroundColor: pathname === "/" ? "neutral.100" : "background"
        }}
      >
        <Search className="h-4 w-4" />
        Explore
      </Link>
      <Link
        href="/chats"
        sx={{
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          backgroundColor: pathname === "/chats" ? "neutral.100" : "background"
        }}
      >
        <MessageSquare className="h-4 w-4" />
        Cards
      </Link>
      <Link
        href={address ? `/${address}` : `/`}
        sx={{
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          backgroundColor: /^0x[a-fA-F0-9]{40}$/gm.test(pathname.slice(1)) ? "neutral.100" : "background"
        }}
      >
        <User className="h-4 w-4" />
        Profile
      </Link>
      <Link
        href={"/invite"}
        sx={{
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          backgroundColor: pathname === "/invite" ? "neutral.100" : "background"
        }}
      >
        <PeopleOutline />
        Invite
      </Link>
    </Flex>
  );
}
