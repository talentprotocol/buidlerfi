"use client";

import { Flex } from "@/components/shared/flex";
import { FundWalletModal } from "@/components/shared/fundTransferModal";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { MIN_BALANCE_ONBOARDING } from "@/lib/constants";
import { formatToDisplayString } from "@/lib/utils";
import { Refresh } from "@mui/icons-material";
import { Button, Chip, IconButton, Skeleton, Typography, useTheme } from "@mui/joy";
import { Transak, TransakConfig } from "@transak/transak-sdk";
import { useState } from "react";

export default function FundPage() {
  const theme = useTheme();
  const router = useBetterRouter();
  const { address, balance, refetchBalance, balanceIsLoading } = useUserContext();
  const [option, setOption] = useState<"transfer" | "bridge" | "none">("none");

  const openTransak = () => {
    const transakConfig: TransakConfig = {
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_KEY || "", // (Required)
      environment: Transak.ENVIRONMENTS.PRODUCTION,
      defaultNetwork: "base",
      network: "base",
      walletAddress: address,
      productsAvailed: "buy",
      cryptoCurrencyList: ["ETH"]
    };

    const transak = new Transak(transakConfig);

    transak.init();
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
              onClick={() => openTransak()}
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
