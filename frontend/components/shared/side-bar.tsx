import { useUserContext } from "@/contexts/userContext";
import { useGetContractData } from "@/hooks/useBuilderFiApi";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { FAQ_LINK } from "@/lib/constants";
import { formatToDisplayString } from "@/lib/utils";
import {
  AccountBalanceWalletOutlined,
  AdminPanelSettings,
  ChatOutlined,
  LiveHelpOutlined,
  Logout,
  PersonOutlineOutlined,
  Refresh,
  SearchOutlined,
  SettingsOutlined
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
  Typography
} from "@mui/joy";
import { ListItemIcon, ListItemText } from "@mui/material";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { FC, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useBalance } from "wagmi";
import { PointsIcon } from "../icons/points";
import { AddToHomePage } from "./add-to-home-page";
import { BannerCard } from "./bannerCard";
import { Flex } from "./flex";
import { WalletAddress } from "./wallet-address";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

interface Navigator extends globalThis.Navigator {
  standalone?: boolean;
}

export const Sidebar: FC<Props> = ({ isOpen, setOpen }) => {
  const { address, user, isLoading, refetch } = useUserContext();
  const { isLoading: isLoadingLinkWallet, linkWallet } = useLinkExternalWallet();
  const contractData = useGetContractData();
  const refreshData = useRefreshCurrentUser();
  const [hasIgnoredInstallApp, setHasIgnoredInstallApp] = useState<boolean>(false);
  const [hasIgnoredConnectWallet, setHasIgnoredConnectWallet] = useState<boolean>(false);
  const { data: balance } = useBalance({
    address
  });
  const router = useRouter();

  const { logout } = usePrivy();
  const handleLogout = useCallback(async () => {
    await logout().then(() => router.push("/signup"));
  }, [logout, router]);

  const navItems = useMemo(
    () => [
      {
        text: "Explore",
        icon: <SearchOutlined />,
        path: "/home"
      },
      { text: "Profile", icon: <PersonOutlineOutlined />, path: "/profile/" + address },
      {
        text: "Wallet",
        icon: <AccountBalanceWalletOutlined />,
        path: "/wallet"
      },
      {
        text: "Points",
        icon: <PointsIcon />,
        path: "/invite"
      },
      {
        text: "Settings",
        icon: <SettingsOutlined />,
        path: "/settings",
        //Hidden for now as we don't have a settings page
        hidden: true
      },
      {
        text: "Admin",
        icon: <AdminPanelSettings />,
        path: "/admin",
        hidden: !user?.isAdmin
      },
      {
        type: "divider"
      },
      {
        text: "Faq",
        icon: <LiveHelpOutlined />,
        onClick: () => window.open(FAQ_LINK)
      },
      {
        text: "Feedback",
        icon: <ChatOutlined />,
        onClick: () => window.open("https://t.me/+7FGAfQx66Z8xOThk")
      },
      {
        text: "Log out",
        icon: <Logout />,
        onClick: () => handleLogout()
      }
    ],
    [address, handleLogout, user?.isAdmin]
  );

  const batchNumber = () => {
    const numberOfBuilders = BigInt(contractData.data?.totalNumberOfBuilders || 0);
    if (numberOfBuilders < 100n) {
      return 1;
    } else if (numberOfBuilders < 200n) {
      return 2;
    } else if (numberOfBuilders < 500n) {
      return 3;
    } else if (numberOfBuilders < 1000n) {
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
      return "200";
    } else if (number === 3) {
      return "500";
    } else if (number === 4) {
      return "1,000";
    } else {
      return "10,000";
    }
  };

  const isInstalled = useMemo(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const { standalone } = navigator as Navigator;
    return document.referrer.startsWith("android-app://") || standalone || isStandalone;
  }, []);

  const cardToDisplay = useMemo(() => {
    if (!isInstalled && !hasIgnoredInstallApp) return "install";
    else if (!user?.socialWallet && !hasIgnoredConnectWallet) return "connect";
    else return "none";
  }, [hasIgnoredConnectWallet, hasIgnoredInstallApp, isInstalled, user?.socialWallet]);

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
            <Typography level="body-sm">
              <Skeleton loading={isLoading}>{formatToDisplayString(balance?.value, 18, 4)} ETH</Skeleton>
            </Typography>
            {user.displayName && (
              <>
                •
                <WalletAddress address={address!} level="body-sm" />
              </>
            )}
          </Flex>
        </Flex>
      </Flex>
      <List>
        {navItems
          .filter(item => !item.hidden)
          .map(item =>
            item.type === "divider" ? (
              <Divider key={"divider"} sx={{ my: 1 }} />
            ) : (
              <ListItem key={item.text}>
                <ListItemButton
                  onClick={() => {
                    if (item.path) {
                      router.push(item.path);
                      setOpen(false);
                    } else if (item.onClick) {
                      item.onClick();
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
          )}
      </List>
      <Flex y p={2} gap1>
        <Flex>
          {cardToDisplay === "install" && (
            <BannerCard
              onClose={() => setHasIgnoredInstallApp(true)}
              title="Enhance Your Experience"
              body="Install the app for a seamless, personalized experience."
            >
              <AddToHomePage />
            </BannerCard>
          )}
          {cardToDisplay === "connect" && (
            <BannerCard
              onClose={() => setHasIgnoredConnectWallet(true)}
              title="Import web3 socials"
              body="Connect your wallet associated with your web3 social profiles to import your data."
            >
              <Button onClick={() => linkWallet()} loading={isLoadingLinkWallet}>
                Connect Wallet
              </Button>
            </BannerCard>
          )}
        </Flex>

        <Flex y xc yc>
          <Typography textColor={"neutral.600"} level="body-sm">
            <strong>Batch 0{batchNumber()}</strong> {contractData.data?.totalNumberOfBuilders}/{batchCount()} keys
            launched
          </Typography>
        </Flex>
      </Flex>
    </Drawer>
  );
};
