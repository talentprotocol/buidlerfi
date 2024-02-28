"use client";
import { useLayoutContext } from "@/contexts/layoutContext";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import Avatar from "@mui/joy/Avatar";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import { usePathname } from "next/navigation";
import { FC, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flex } from "./flex";
import { Sidebar } from "./side-bar";

export const Topbar = () => {
  const { topBarRef } = useLayoutContext();

  return (
    <Flex
      x
      xsb
      yc
      py={1}
      px={2}
      sx={{
        backgroundColor: theme => theme.palette.background.body,
        position: "sticky",
        top: 0,
        zIndex: 2,
        minHeight: "41px"
      }}
      borderBottom={"1px solid var(--neutral-outlined-border, #CDD7E1)"}
      ref={topBarRef}
    ></Flex>
  );
};

interface InjectProps {
  startItem?: React.ReactNode;
  endItem?: React.ReactNode;
  centerItem?: React.ReactNode;
  fullItem?: React.ReactNode;
  title?: string;
  withBack?: boolean;
}

export const BackButton = () => {
  const router = useBetterRouter();

  return (
    <IconButton onClick={() => router.back()}>
      <ArrowBackOutlined />
    </IconButton>
  );
};

export const InjectTopBar: FC<InjectProps> = ({ startItem, endItem, centerItem, fullItem, title, withBack }) => {
  const router = useBetterRouter();
  const anchor = useRef<HTMLDivElement>(null);
  const { user, isAuthenticatedAndActive } = useUserContext();
  const { topBarRef } = useLayoutContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!topBarRef?.current) return <></>;

  if (fullItem) return createPortal(<>{fullItem}</>, topBarRef.current);
  else if (startItem || centerItem) {
    return createPortal(
      <>
        <Flex x xs yc basis="100%">
          {withBack ? <BackButton /> : startItem}
        </Flex>
        <Flex x xc yc basis="100%">
          {centerItem ? (
            centerItem
          ) : title ? (
            <Typography level="title-md" textAlign="center">
              {title}
            </Typography>
          ) : (
            <></>
          )}
        </Flex>
        <Flex x xe yc basis="100%">
          {endItem}
        </Flex>
      </>,
      topBarRef.current
    );
  }

  const defaultItem = (
    <>
      <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <Flex basis="100%">
        {withBack ? (
          <BackButton />
        ) : (
          <Avatar
            size="md"
            ref={anchor}
            alt={user?.displayName?.[0]}
            src={isAuthenticatedAndActive ? user?.avatarUrl || undefined : LOGO_BLUE_BACK}
            sx={{ position: "relative", cursor: "pointer" }}
            onClick={() => (!isAuthenticatedAndActive ? router.push("/home") : setIsSidebarOpen(true))}
          />
        )}
      </Flex>

      <Flex basis="100%" x xc yc>
        <Typography textTransform="lowercase" level="title-md" textAlign="center">
          {title || pathname.split("/")[1]}
        </Typography>
      </Flex>

      <Flex basis="100%" y xe>
        {endItem}
      </Flex>
    </>
  );

  return createPortal(defaultItem, topBarRef.current);
};
