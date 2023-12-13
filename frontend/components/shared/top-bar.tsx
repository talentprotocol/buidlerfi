"use client";
import { useLayoutContext } from "@/contexts/layoutContext";
import { useUserContext } from "@/contexts/userContext";
import { ArrowBackOutlined } from "@mui/icons-material";
import { Avatar, IconButton, Typography } from "@mui/joy";
import { usePathname, useRouter } from "next/navigation";
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
        zIndex: 2
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
  const router = useRouter();
  return (
    <IconButton onClick={() => router.back()}>
      <ArrowBackOutlined />
    </IconButton>
  );
};

export const InjectTopBar: FC<InjectProps> = ({ startItem, endItem, centerItem, fullItem, title, withBack }) => {
  const anchor = useRef<HTMLDivElement>(null);
  const { user } = useUserContext();
  const { topBarRef } = useLayoutContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!topBarRef?.current) return <></>;

  if (fullItem) return createPortal(fullItem, topBarRef.current);
  else if (startItem || endItem || centerItem) {
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
            src={user?.avatarUrl || undefined}
            sx={{ position: "relative", cursor: "pointer" }}
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
      </Flex>

      <Flex basis="100%" x xc yc>
        <Typography textTransform="lowercase" level="title-md" textAlign="center">
          {title || pathname.split("/")[1]}
        </Typography>
      </Flex>

      <Flex basis="100%" y xe px={1}>
        {/* <ToggleOnOutlined /> */}
      </Flex>
    </>
  );

  return createPortal(defaultItem, topBarRef.current);
};
