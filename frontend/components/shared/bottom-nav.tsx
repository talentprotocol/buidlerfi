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
        label: <HomeIcon fontSize="xl" />
      },
      {
        path: "/explore",
        label: <SearchIcon fontSize="xl" />
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
        label: <KeyIcon fontSize="xl" />
      },
      {
        path: "/notifications",
        label: (
          <Badge invisible={unreadNotifsCount === 0} badgeContent={unreadNotifsCount}>
            <NotificationIcon fontSize="xl" />
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
      xsa
      component="nav"
      pt={1}
      pb={1.5}
      sx={{
        borderTop: "1px solid var(--neutral-outlined-border, #CDD7E1)",
        position: "sticky",
        bottom: 0,
        backgroundColor: "white",
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
