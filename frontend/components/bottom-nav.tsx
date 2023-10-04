import Link from "next/link";
import { Search, MessageSquare, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

export function BottomNav() {
  const pathname = usePathname();
  const { address } = useAccount();

  return (
    <nav className={"fixed flex items-center justify-around py-4 bottom-0 left-0 border-t w-full bg-white"}>
      <Link
        href="/"
        className={`text-sm font-medium transition-colors hover:text-primary flex flex-col items-center ${
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Search className="h-4 w-4" />
        Explore
      </Link>
      <Link
        href="/chats"
        className={`text-sm font-medium transition-colors hover:text-primary flex flex-col items-center ${
          pathname === "/chats" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <MessageSquare className="h-4 w-4" />
        Chats
      </Link>
      <Link
        href={address ? `/${address}` : `/`}
        className={`text-sm font-medium transition-colors hover:text-primary flex flex-col items-center ${
          pathname.length > 6 ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User className="h-4 w-4" />
        Profile
      </Link>
    </nav>
  );
}
