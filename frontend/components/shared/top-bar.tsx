"use client";
import { useUserContext } from "@/contexts/userContext";
import { DEFAULT_PROFILE_PICTURE, LOGO_SMALL } from "@/lib/assets";
import { Avatar, Skeleton } from "@mui/joy";
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
  const { user, isLoading } = useUserContext();

  return (
    <>
      <Flex
        x
        xsb
        yc
        p={2}
        sx={{ width: "calc(100% - 32px)", backgroundColor: "Background", position: "sticky", top: 0, zIndex: 2 }}
        borderBottom={"1px solid var(--neutral-outlined-border, #CDD7E1)"}
      >
        <Avatar
          ref={anchor}
          src={user?.avatarUrl || DEFAULT_PROFILE_PICTURE}
          onClick={() => setOpen(true)}
          sx={{ position: "relative", cursor: "pointer" }}
        >
          <Skeleton loading={isLoading} />
        </Avatar>
        <Image
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/home")}
          alt="App logo"
          src={LOGO_SMALL}
          height={40}
          width={40}
        />

        <Flex height={40} width={40} />
      </Flex>
    </>
  );
};
