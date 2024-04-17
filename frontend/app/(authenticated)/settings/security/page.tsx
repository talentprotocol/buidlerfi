"use client";

import { Flex } from "@/components/shared/flex";
import { BackButton, InjectTopBar } from "@/components/shared/top-bar";
import Button from "@mui/joy/Button";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import { WalletWithMetadata, usePrivy } from "@privy-io/react-auth";

export default function SecurityPage() {
  const { user, setWalletPassword } = usePrivy();
  const embeddedWallet = user?.linkedAccounts.find(
    account => account.type === "wallet" && account.walletClientType === "privy"
  ) as WalletWithMetadata;
  const alreadyHasPassword = embeddedWallet?.recoveryMethod === "user-passcode";

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar title="Security" startItem={<BackButton />} />
      <Flex y m={2} p={1.5} style={{ borderRadius: "10px", backgroundColor: "#F0F4F8" }}>
        <Typography level="title-sm" fontWeight={"600"}>
          Add a password
        </Typography>
        <Typography level="body-sm">
          Add a password to secure your privy wallet. You must remember this password. If you lose this password you can
          permanently lose access to your wallet.
        </Typography>
        <Link color="primary" underline={"always"} href="https://privy.xyz/security" sx={{ fontSize: "14px" }}>
          learn more about privy security here
        </Link>
        <Flex x xs>
          <Button
            sx={{ minHeight: "32px", marginTop: "16px" }}
            variant={!alreadyHasPassword ? "solid" : "outlined"}
            color={!alreadyHasPassword ? "primary" : "neutral"}
            size="sm"
            onClick={setWalletPassword}
            disabled={!!embeddedWallet || !alreadyHasPassword}
          >
            Add Password
            {/* {!alreadyHasPassword ? <Add /> : ""}
            {!alreadyHasPassword ? "Add password" : "Change password"} */}
          </Button>
        </Flex>
      </Flex>
      <Flex x xc gap3 m={2} p={1.5} style={{ borderRadius: "10px", backgroundColor: "#F0F4F8" }}>
        <Link
          color="primary"
          target="_blank"
          href="https://talentprotocol.notion.site/Privacy-Policy-cc2b297006b54b3db1a008592302ccf5"
          sx={{ fontSize: "14px" }}
        >
          Privacy Policy
        </Link>
        <Link
          color="primary"
          target="_blank"
          href="https://talentprotocol.notion.site/Terms-Conditions-ec060cb6c06e49a98f17d235d0835773"
          sx={{ fontSize: "14px" }}
        >
          Terms of Conditions
        </Link>
      </Flex>
    </Flex>
  );
}
