import { useUserContext } from "@/contexts/userContext";
import { useGetHolders } from "@/hooks/useBuilderFiApi";
import { DEFAULT_PROFILE_PICTURE, LOGO } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { AccountBalanceWalletOutlined, ContentCopy, PersonOutlineOutlined, SearchOutlined } from "@mui/icons-material";
import { Avatar, Button, Drawer, IconButton, List, ListItem, ListItemButton, Typography } from "@mui/joy";
import { ListItemIcon, ListItemText } from "@mui/material";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { useBalance } from "wagmi";
import { ParachuteIcon } from "../icons/parachute";
import { Flex } from "./flex";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const Sidebar: FC<Props> = ({ isOpen, setOpen }) => {
  const { address, user } = useUserContext();
  const holders = useGetHolders(address);
  const { data: balance } = useBalance({
    address
  });
  const router = useRouter();

  const { logout } = usePrivy();
  const handleLogout = async () => {
    await logout().then(() => router.push("/signup"));
  };

  const navItems = useMemo(
    () => [
      { text: "Profile", icon: <PersonOutlineOutlined />, path: "/profile/" + address },
      {
        text: "Explore",
        icon: <SearchOutlined />,
        path: "/home"
      },
      {
        text: "Wallet",
        icon: <AccountBalanceWalletOutlined />,
        path: "/wallet"
      },
      {
        text: "Airdrop",
        icon: <ParachuteIcon />,
        path: "/invite"
      }
    ],
    [address]
  );

  if (!user) return <></>;

  return (
    <Drawer open={isOpen} onClose={() => setOpen(false)}>
      <Flex y gap2 p={2}>
        <Flex x xsb yc>
          <Avatar
            src={user?.avatarUrl || DEFAULT_PROFILE_PICTURE}
            onClick={() => setOpen(false)}
            sx={{ position: "relative" }}
          />
          <Button variant="soft" onClick={handleLogout}>
            Log out
          </Button>
        </Flex>
        <Flex y gap={0.5}>
          <Flex x yc>
            <Typography textColor={"neutral.800"} fontWeight={600} level="body-sm">
              {user.displayName || shortAddress(user.wallet)}
            </Typography>
            <IconButton size="sm" onClick={() => window.navigator.clipboard.writeText(user.wallet)}>
              <ContentCopy sx={{ fontSize: "0.9rem" }} />
            </IconButton>
          </Flex>
          <Typography textColor={"neutral.600"} level="body-sm">
            {holders.data?.length || 0} holders • Balance {balance?.formatted.slice(0, 8)} ETH
          </Typography>
        </Flex>
      </Flex>
      <List>
        {navItems.map(item => (
          <ListItem key={item.text}>
            <ListItemButton
              onClick={() => {
                router.push(item.path);
                setOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Flex y xs p={2} gap3>
        <Image src={LOGO} alt="App logo" height={40} width={120} />
      </Flex>
    </Drawer>
  );
};
