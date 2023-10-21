"use client";

import { BottomNav } from "@/components/shared/bottom-nav";
import { NavBalance } from "@/components/shared/nav-balance";
import { NavWeb3Button } from "@/components/shared/nav-web3-button";

import { Flex } from "@/components/shared/flex";
import { LOGO, LOGO_SMALL } from "@/lib/assets";
import theme from "@/theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Flex y py={7} grow>
      <Flex
        x
        xsb
        yc
        p={2}
        sx={{ width: "calc(100% - 32px)", backgroundColor: "Background" }}
        className="h-8 fixed top-0 left-0 z-10"
      >
        <Image
          className="cursor-pointer"
          onClick={() => router.push("/")}
          alt="App logo"
          src={isSm ? LOGO_SMALL : LOGO}
          height={40}
          width={isSm ? 40 : 150}
        />
        <Flex x yc gap2>
          <NavBalance />
          <NavWeb3Button />
        </Flex>
      </Flex>
      {children}
      <BottomNav />
    </Flex>
  );
}
