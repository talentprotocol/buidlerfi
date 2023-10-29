"use client";
import { useUserContext } from "@/contexts/userContext";
import { LOGO, LOGO_SMALL } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import theme from "@/theme";
import { AccountCircle } from "@mui/icons-material";
import { Button } from "@mui/joy";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Flex } from "./flex";

export function Topbar() {
  const router = useRouter();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { address } = useUserContext();
  const { logout } = usePrivy();

  const handleLogout = async () => {
    await logout().then(() => router.push("/signup"));
  };
  // const { data: balance } = useBalance({
  //   address
  // });

  return (
    <Flex
      x
      xsb
      yc
      p={2}
      sx={{ width: "calc(100% - 32px)", backgroundColor: "Background", position: "sticky", top: 0, zIndex: 2 }}
      borderBottom={"1px solid var(--neutral-outlined-border, #CDD7E1)"}
    >
      <Image
        className="cursor-pointer"
        onClick={() => router.push("/home")}
        alt="App logo"
        src={isSm ? LOGO_SMALL : LOGO}
        height={40}
        width={isSm ? 40 : 150}
      />

      {address && (
        <Button startDecorator={<AccountCircle sx={{ fontSize: "24px" }} />} onClick={handleLogout}>
          {shortAddress(address)}
        </Button>
      )}

      {/* <Flex x yc gap2>
        {balance && (
          <Typography>
            {parseFloat(balance?.formatted).toFixed(3)} {balance?.symbol}
          </Typography>
        )}
        {address && <Button onClick={logout}>{shortAddress(address)}</Button>}
      </Flex> */}
    </Flex>
  );
}
