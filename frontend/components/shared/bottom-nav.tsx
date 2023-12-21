import { HomeIcon } from "@/components/icons/home";
import { SearchIcon } from "@/components/icons/search";
import { useUserContext } from "@/contexts/userContext";
import { Add } from "@mui/icons-material";
import { Badge, Button, Link as JoyLink } from "@mui/joy";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { KeyIcon } from "../icons/key";
import { NotificationIcon } from "../icons/notification";
import { Flex } from "./flex";

export function BottomNav() {
  const pathname = usePathname();
  const { notifications } = useUserContext();

  const unreadNotifsCount = useMemo(
    () => notifications?.filter(notification => !notification.isRead).length || 0,
    [notifications]
  );

  const paths = useMemo(
    () => [
      {
        path: "/home",
        label: <HomeIcon fontSize="xl2" />
      },
      {
        path: "/explore",
        label: <SearchIcon fontSize="xl2" />
      },
      {
        path: "/question",
        label: (
          <Button
            sx={{
              borderRadius: "24px",
              height: "40px",
              width: "40px",
              boxShadow: "0px 0px 16px 0px rgba(11, 110, 249, 0.40)"
            }}
          >
            <Add />
          </Button>
        )
      },
      {
        path: "/keys",
        label: <KeyIcon fontSize="xl2" />
      },
      {
        path: "/notifications",
        label: (
          <Badge invisible={unreadNotifsCount === 0} badgeContent={unreadNotifsCount}>
            <NotificationIcon fontSize="xl2" />
          </Badge>
        )
      }
    ],
    [unreadNotifsCount]
  );

  return (
    <Flex
      x
      yc
      xsb
      component="nav"
      grow
      px={2}
      py={1}
      sx={{
        width: "calc(min(100vw, 500px) - 32px)",
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translate(-50%)",
        backgroundColor: "white",
        borderTop: "1px solid var(--neutral-outlined-border, #CDD7E1)",
        borderLeft: "1px solid var(--neutral-outlined-border, #CDD7E1)",
        borderRight: "1px solid var(--neutral-outlined-border, #CDD7E1)",
        backdropFilter: "blur(10px)"
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
            color: pathname === item.path ? "primary.main" : "text.icon",
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
