"use client";

import { Flex } from "@/components/shared/flex";
import { BackButton, InjectTopBar } from "@/components/shared/top-bar";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { ArrowForwardIosOutlined, Logout } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import { usePrivy } from "@privy-io/react-auth";
import { useCallback } from "react";

export default function SettingsPage() {
  const router = useBetterRouter();
  const { logout, exportWallet, user } = usePrivy();

  const renderButton = ({ label, path, onClick }: { label: string; path?: string; onClick?: () => void }) => {
    return (
      <Button fullWidth sx={{ minHeight: "48px" }} onClick={() => (onClick ? onClick() : router.push(path!))}>
        <Flex fullwidth x xsb yc grow>
          {label}
          {onClick ? <Logout fontSize="small" /> : <ArrowForwardIosOutlined fontSize="small" />}
        </Flex>
      </Button>
    );
  };
  const hasEmbeddedWallet = !!user?.linkedAccounts.find(
    account => account.type === "wallet" && account.walletClient === "privy"
  );

  const handleLogout = useCallback(async () => {
    await logout().then(() => router.push("/signup"));
  }, [logout, router]);

  return (
    <Flex component={"main"} y grow gap2>
      <InjectTopBar title="settings" startItem={<BackButton />} />
      <Flex y px={2} pt={1}>
        <Typography level="title-sm" textColor={"neutral.600"} py={1}>
          Account
        </Typography>
        <ButtonGroup orientation="vertical" spacing={0} variant="soft" size="sm">
          {renderButton({ label: "Linked accounts", path: "/settings/linkedaccount" })}
          <Button fullWidth sx={{ minHeight: "48px" }} onClick={exportWallet} disabled={!hasEmbeddedWallet}>
            <Flex fullwidth x xsb yc grow>
              export builderfi wallet
              <ArrowForwardIosOutlined fontSize="small" />
            </Flex>
          </Button>
        </ButtonGroup>
      </Flex>
      <Flex y px={2}>
        <Typography level="title-sm" textColor={"neutral.600"} py={1}>
          App
        </Typography>
        <ButtonGroup orientation="vertical" spacing={0} variant="soft" size="sm">
          {/* {renderButton({ label: "Notifications", path: "/settings/notifications" })} */}
          {renderButton({ label: "Security", path: "/settings/security" })}
          {renderButton({ label: "Logout", onClick: handleLogout })}
        </ButtonGroup>
      </Flex>
    </Flex>
  );
}
