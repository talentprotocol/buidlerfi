"use client";
import { useUserContext } from "@/contexts/userContext";
import { DEFAULT_PROFILE_PICTURE, LOGO_SMALL } from "@/lib/assets";
import { Menu } from "@mui/icons-material";
import { Avatar, IconButton, Skeleton } from "@mui/joy";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useRef } from "react";
import { Flex } from "./flex";

interface Props {
  setOpen: (isOpen: boolean) => void;
}

export const Topbar: FC<Props> = ({ setOpen }) => {
  const router = useRouter();
  const anchor = useRef<HTMLDivElement>(null);
  const { user, address, isLoading } = useUserContext();

  return (
    <Flex
      x
      xsb
      yc
      p={1}
      sx={{
        backgroundColor: theme => theme.palette.background.body,
        position: "sticky",
        top: 0,
        zIndex: 2
      }}
      borderBottom={"1px solid var(--neutral-outlined-border, #CDD7E1)"}
    >
      <Flex basis="100%">
        <IconButton onClick={() => setOpen(true)}>
          <Menu />
        </IconButton>
      </Flex>
      <Image
        style={{ cursor: "pointer", flexBasis: "100%" }}
        onClick={() => router.push("/home")}
        alt="App logo"
        src={LOGO_SMALL}
        height={40}
        width={40}
      />

      <Flex basis="100%" y xe px={1}>
        <Avatar
          size="md"
          ref={anchor}
          src={user?.avatarUrl || DEFAULT_PROFILE_PICTURE}
          sx={{ position: "relative", cursor: "pointer" }}
          onClick={() => router.push("/profile/" + address)}
        >
          <Skeleton loading={isLoading} />
        </Avatar>
      </Flex>
    </Flex>
  );
};
