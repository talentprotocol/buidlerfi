import { useUserContext } from "@/contexts/userContext";
import { useGetContractData, useGetHolders } from "@/hooks/useBuilderFiApi";
import { DEFAULT_PROFILE_PICTURE, LOGO } from "@/lib/assets";
import { formatToDisplayString, shortAddress } from "@/lib/utils";
import {
  AccountBalanceWalletOutlined,
  AdminPanelSettings,
  ContentCopy,
  Logout,
  PersonOutlineOutlined,
  SearchOutlined
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Typography,
  useTheme
} from "@mui/joy";
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
  const theme = useTheme();
  const contractData = useGetContractData();
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
        text: "Points",
        icon: <ParachuteIcon />,
        path: "/invite"
      },
      {
        text: "Admin",
        icon: <AdminPanelSettings />,
        path: "/admin",
        hidden: !user?.isAdmin
      }
    ],
    [address, user?.isAdmin]
  );

  const batchNumber = () => {
    const numberOfBuilders = BigInt(contractData.data?.totalNumberOfBuilders || 0);
    if (numberOfBuilders < 100n) {
      return 1;
    } else if (numberOfBuilders < 500n) {
      return 2;
    } else if (numberOfBuilders < 1000n) {
      return 3;
    } else if (numberOfBuilders < 3000n) {
      return 4;
    }
    {
      return "5+";
    }
  };
  const batchCount = () => {
    const number = batchNumber();
    if (number === 1) {
      return "100";
    } else if (number === 2) {
      return "500";
    } else if (number === 3) {
      return "1,000";
    } else if (number === 4) {
      return "3,000";
    } else {
      return "10,000";
    }
  };

  if (!user) return <></>;

  return (
    <Drawer open={isOpen} onClose={() => setOpen(false)}>
      <Flex y gap2 p={2}>
        <Avatar
          src={user?.avatarUrl || DEFAULT_PROFILE_PICTURE}
          onClick={() => setOpen(false)}
          sx={{ position: "relative" }}
        />
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
            {holders.data?.length || 0} holders • Balance {formatToDisplayString(balance?.value)} ETH
          </Typography>
          <Button variant="plain" onClick={() => window.open("https://bridge.base.org/deposit")}>
            Deposit Funds
          </Button>
        </Flex>
      </Flex>
      <List>
        {navItems
          .filter(item => !item.hidden)
          .map(item => (
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
        <Divider sx={{ my: 1 }} />
        <ListItem>
          <ListItemButton
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
          >
            <ListItemIcon>
              <Logout sx={{ color: theme.palette.danger[500] + " !important" }} />
            </ListItemIcon>
            <ListItemText sx={{ ".MuiTypography-root": { color: theme.palette.danger[500] } }} primary="Log out" />
          </ListItemButton>
        </ListItem>
      </List>
      <Flex y xs p={2} gap3>
        <div>
          <Typography textColor={"neutral.600"} level="body-sm">
            <>
              Batch {"#"}
              {batchNumber()}
            </>
          </Typography>
          <Typography textColor={"neutral.600"} level="body-sm">
            <>
              {contractData.data?.totalNumberOfBuilders}/{batchCount()} builders have signed up already
            </>
          </Typography>
        </div>
        <Button
          variant="soft"
          onClick={() => window.open("https://twitter.com/messages/compose?recipient_id=1709427051135160320")}
        >
          Give Feedback
        </Button>
        <Image src={LOGO} alt="App logo" height={40} width={120} />
      </Flex>
    </Drawer>
  );
};
