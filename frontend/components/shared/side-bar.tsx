import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useLinkExternalWallet } from "@/hooks/useLinkWallet";
import { useRefreshCurrentUser } from "@/hooks/useUserApi";
import { FAQ_LINK } from "@/lib/constants";
import { formatToDisplayString } from "@/lib/utils";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import LiveHelpOutlined from "@mui/icons-material/LiveHelpOutlined";
import Logout from "@mui/icons-material/Logout";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import Refresh from "@mui/icons-material/Refresh";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

import Avatar from "@mui/joy/Avatar";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Drawer from "@mui/joy/Drawer";
import IconButton from "@mui/joy/IconButton";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import Skeleton from "@mui/joy/Skeleton";
import Typography from "@mui/joy/Typography";

import { ListItemContent, ListItemDecorator } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { FC, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useBalance } from "wagmi";
import { PointsIcon } from "../icons/points";
import { BannerCard } from "./bannerCard";
import { Flex } from "./flex";
import { WalletAddress } from "./wallet-address";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export const Sidebar: FC<Props> = ({ isOpen, setOpen }) => {
  const { address, user, isLoading, refetch } = useUserContext();
  const { isLoading: isLoadingLinkWallet, linkWallet } = useLinkExternalWallet();
  const refreshData = useRefreshCurrentUser();
  const [hasIgnoredConnectWallet, setHasIgnoredConnectWallet] = useState<boolean>(false);
  const { data: balance } = useBalance({
    address
  });
  const router = useBetterRouter();

  const { logout } = usePrivy();
  const handleLogout = useCallback(async () => {
    await logout().then(() => router.push("/home"));
  }, [logout, router]);

  const navItems = useMemo(
    () => [
      { text: "Profile", icon: <PersonOutlineOutlined />, path: "/profile/" + address },
      {
        text: "Wallet",
        icon: <AccountBalanceWalletOutlined />,
        path: "/wallet"
      },
      {
        text: "Points",
        icon: <PointsIcon />,
        path: "/points"
      },
      {
        text: "Settings",
        icon: <SettingsOutlined />,
        path: "/settings"
        //Hidden for now as we don't have a settings page
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
        text: "Log out",
        icon: <Logout />,
        onClick: () => handleLogout()
      }
    ],
    [address, handleLogout, user?.isAdmin]
  );

  const cardToDisplay = useMemo(() => {
    if (!user?.socialWallet && !hasIgnoredConnectWallet) return "connect";
    else return "none";
  }, [hasIgnoredConnectWallet, user?.socialWallet]);

  if (!user) return <></>;

  return (
    <Drawer open={isOpen} onClose={() => setOpen(false)}>
      <Flex y gap2 p={2}>
        <Avatar src={user?.avatarUrl || undefined} onClick={() => setOpen(false)} sx={{ position: "relative" }} />
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
              <ListItem key={item.text} variant="plain">
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
                  <ListItemDecorator>{item.icon}</ListItemDecorator>
                  <ListItemContent>{item.text}</ListItemContent>
                </ListItemButton>
              </ListItem>
            )
          )}
      </List>
      <Flex xc y p={2} gap1>
        <Flex>
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
      </Flex>
    </Drawer>
  );
};
