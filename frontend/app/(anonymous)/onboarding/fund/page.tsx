"use client";

import { Flex } from "@/components/shared/flex";
import { FundWalletModal } from "@/components/shared/fundTransferModal";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { MIN_BALANCE_ONBOARDING } from "@/lib/constants";
import { formatToDisplayString } from "@/lib/utils";
import { Refresh } from "@mui/icons-material";
import { Button, Chip, IconButton, Skeleton, Typography, useTheme } from "@mui/joy";
import { MoonpayConfig, useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useEffect, useState } from "react";

export default function FundPage() {
  const theme = useTheme();
  const router = useBetterRouter();
  const { address, balance, refetchBalance, balanceIsLoading } = useUserContext();
  const [option, setOption] = useState<"transfer" | "bridge" | "none">("none");

  const { setActiveWallet, wallet } = usePrivyWagmi();
  const { wallets } = useWallets();

  //Ensure the active wallet is the embedded wallet from Privy
  useEffect(() => {
    const found = wallets.find(wal => wal.walletClientType === "privy");
    if (found) {
      setActiveWallet(found);
    }
  }, [setActiveWallet, wallets]);

  const openMoonpay = async () => {
    if (!wallet) return;

    const fundWalletConfig = {
      currencyCode: "ETH_BASE", // Purchase ETH on Ethereum mainnet
      quoteCurrencyAmount: 0.05, // Purchase 0.05 ETH
      paymentMethod: "credit_debit_card" // Purchase with credit or debit card
    } as unknown;

    await wallet.fund({ config: fundWalletConfig as MoonpayConfig });
  };

  const closeAndRefresh = () => {
    setOption("none");
    refetchBalance();
  };

  const openTransferModal = () => {
    setOption("transfer");
  };

  const openBridgeModal = () => {
    setOption("bridge");
  };

  const hasEnoughBalance = balance && balance >= MIN_BALANCE_ONBOARDING;

  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex y>
          <Typography level="h3">Top up your account</Typography>
          <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
            builder.fi is built on Base and uses ETH as currency. We suggest a deposit of {">"} 0.001 ETH (~$2) to fully
            test the app. You can withdraw your funds at any time.
          </Typography>
        </Flex>
      </Flex>
      <Flex y gap1>
        <Flex y gap2>
          {address && (
            <Button
              color="neutral"
              variant="outlined"
              onClick={() => openMoonpay()}
              sx={{
                p: 2,
                ".MuiBox-root": {
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%"
                }
              }}
            >
              <Flex x yc gap3>
                <Flex x yc xsb>
                  <Typography level="title-md">Deposit with USD or EUR</Typography>
                  <Chip variant="solid" color="primary">
                    Popular
                  </Chip>
                </Flex>
              </Flex>
            </Button>
          )}
        </Flex>

        {address && (
          <Button
            color="neutral"
            variant="outlined"
            onClick={() => openTransferModal()}
            sx={{
              p: 2,
              ".MuiBox-root": {
                display: "flex",
                textAlign: "start",
                justifyContent: "space-between",
                width: "100%"
              }
            }}
          >
            <Flex x yc gap3>
              <Flex y gap1>
                <Typography level="title-md">
                  Transfer ETH on <span style={{ textTransform: "none" }}>Base</span>
                </Typography>
              </Flex>
            </Flex>
          </Button>
        )}

        <Button
          color="neutral"
          variant="outlined"
          onClick={() => openBridgeModal()}
          sx={{
            p: 2,
            ".MuiBox-root": {
              display: "flex",
              textAlign: "start",
              justifyContent: "space-between",
              width: "100%"
            }
          }}
        >
          <Flex x yc gap3 fullwidth>
            <Flex y gap1>
              <Typography level="title-md">Bridge from other chains</Typography>
            </Flex>
          </Flex>
        </Button>
      </Flex>
      <Flex y gap2>
        <Flex x yc xc gap1 fullwidth>
          <Typography level="body-md" textColor={"neutral.600"} textAlign="center">
            <Skeleton loading={balanceIsLoading}>
              builder.fi wallet balance: {formatToDisplayString(balance, 18)} ETH
            </Skeleton>
          </Typography>
          <IconButton onClick={refetchBalance}>
            <Refresh fontSize="small" htmlColor={theme.palette.neutral[500]} />
          </IconButton>
        </Flex>

        <Button
          size="lg"
          onClick={() =>
            hasEnoughBalance
              ? router.replace("/", { preserveSearchParams: true })
              : router.push({ searchParams: { skipFund: "1" } }, { preserveSearchParams: true })
          }
          variant={hasEnoughBalance ? "solid" : "plain"}
        >
          {hasEnoughBalance ? "Continue" : "Continue without top up"}
        </Button>
      </Flex>
      {option !== "none" && <FundWalletModal address={address} close={closeAndRefresh} type={option} />}
    </Flex>
  );
}
