import { isEVMAddress } from "@/lib/utils";
import { Link as JoyLink } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Flex } from "./flex";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = usePrivy();
  const address = (user?.wallet?.address as `0x${string}`) || "0x0";

  const paths = useMemo(
    () => [
      {
        path: "/home",
        check: (pathname: string) => pathname === "/home",
        label: "Explore"
      },
      {
        path: "/chats",
        check: (pathname: string) => pathname === "/chats",
        label: "Keys"
      },
      {
        path: "/" + address,
        check: (pathname: string) => isEVMAddress(pathname.slice(1)),
        label: "Profile"
      },
      {
        path: "/invite",
        check: (pathname: string) => pathname === "/invite",
        label: "Points"
      }
    ],
    [address]
  );

  return (
    <Flex
      x
      yc
      xsa
      component="nav"
      grow
      sx={{
        margin: "auto",
        position: "fixed",
        bottom: 0,
        left: "50%",
        width: "100%",
        maxWidth: "500px",
        backgroundColor: "white",
        transform: "translateX(-50%)"
      }}
    >
      {paths.map(item => (
        <JoyLink
          key={item.path}
          component={Link}
          href={item.path}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            height: "64px",
            width: "100%",
            backgroundColor: item.check(pathname) ? "neutral.100" : "background",
            ":hover": {
              textDecoration: "none"
            }
          }}
        >
          {item.label}
        </JoyLink>
      ))}
    </Flex>
  );
}
