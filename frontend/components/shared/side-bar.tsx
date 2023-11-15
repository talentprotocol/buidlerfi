import { useUserContext } from "@/contexts/userContext";
import { useGetContractData } from "@/hooks/useBuilderFiApi";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { DEFAULT_PROFILE_PICTURE, LOGO } from "@/lib/assets";
import { formatToDisplayString } from "@/lib/utils";
import {
  AccountBalanceWalletOutlined,
  AdminPanelSettings,
  Logout,
  PersonOutlineOutlined,
  Refresh,
  SearchOutlined,
  WalletOutlined
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
  Skeleton,
  Typography,
  useTheme
} from "@mui/joy";
import { ListItemIcon, ListItemText } from "@mui/material";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useMemo } from "react";
import { toast } from "react-toastify";
import { useBalance } from "wagmi";
import { ParachuteIcon } from "../icons/parachute";
import { Flex } from "./flex";
import { WalletAddress } from "./wallet-address";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const Sidebar: FC<Props> = ({ isOpen, setOpen }) => {
  const { address, user, isLoading, refetch } = useUserContext();
  const theme = useTheme();
  const contractData = useGetContractData();
  const refreshData = useRefreshCurrentUser();
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
        <Flex y>
          <Flex x yc>
            {user.displayName ? (
              <Typography level="h3">
                <Skeleton loading={isLoading}>{user.displayName}</Skeleton>
              </Typography>
            ) : (
              <WalletAddress address={address!} level="h3" />
            )}
            <IconButton
              disabled={refreshData.isLoading}
              onClick={() =>
                refreshData
                  .mutateAsync()
                  .then(() => refetch())
                  .then(() => toast.success("Profile refreshed"))
              }
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Flex>
          {/* Only display if user has a display name */}
          <Flex x yc gap={0.5} height="20px">
            <Typography level="body-sm" startDecorator={<WalletOutlined fontSize="small" />}>
              <Skeleton loading={isLoading}>{formatToDisplayString(balance?.value)} ETH</Skeleton>
            </Typography>
            {user.displayName && (
              <>
                •
                <WalletAddress address={address!} level="body-sm" removeCopyButton={true} />
              </>
            )}
          </Flex>
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
              {contractData.data?.totalNumberOfBuilders}/{batchCount()} builders joined
            </>
          </Typography>
        </div>
        <Flex x gap2>
          <Button
            variant="outlined"
            onClick={() =>
              window.open("https://talentprotocol.notion.site/builder-fi-FAQ-dcebfe7103b34d11aba90de032173b39?pvs=4")
            }
          >
            FAQ
          </Button>
          <Button variant="soft" onClick={() => window.open("https://t.me/+7FGAfQx66Z8xOThk")}>
            Give Feedback
          </Button>
        </Flex>
        <Image src={LOGO} alt="App logo" height={40} width={120} />
      </Flex>
    </Drawer>
  );
};
