"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { formatToDisplayString, shortAddress } from "@/lib/utils";
import { Close, CopyAll, CreditCard, Refresh, SwapHoriz, Wallet } from "@mui/icons-material";
import { Button, Card, DialogTitle, IconButton, Modal, ModalDialog, Skeleton, Typography, useTheme } from "@mui/joy";
import { Transak, TransakConfig } from "@transak/transak-sdk";
import { useState } from "react";
import { toast } from "react-toastify";

export default function FundPage() {
  const theme = useTheme();
  const router = useBetterRouter();
  const { address, balance, refetchBalance, balanceIsLoading } = useUserContext();
  const [option, setOption] = useState("transfer");
  const [modalOpen, setModalOpen] = useState(false);

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
    setModalOpen(false);
    refetchBalance();
  };

  const openTransferModal = () => {
    setOption("transfer");
    setModalOpen(true);
  };

  const openBridgeModal = () => {
    setOption("bridge");
    setModalOpen(true);
  };

  return (
    <Flex y gap={4}>
      <Flex y>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Top up your account
        </Typography>
        <Typography level="body-sm" mt={1}>
          builder.fi is built on Base, an Ethereum L2, and uses ETH to buy and sell keys. You need to deposit at least
          0.001 eth to create your account. Here are 3 options to quickly top up your builder.fi wallet:
        </Typography>
      </Flex>

      <Flex y gap2>
        {address && (
          <Button variant="plain" onClick={() => openTransak()} fullWidth style={{ padding: 0 }}>
            <Flex x yc xsb component={Card} fullwidth>
              <Flex x yc gap3>
                <CreditCard fontSize="large" />
                <Flex y gap1>
                  <Typography level="title-md">Deposit with fiat</Typography>
                </Flex>
              </Flex>
            </Flex>
          </Button>
        )}
      </Flex>

      {address && (
        <Button variant="plain" onClick={() => openTransferModal()} fullWidth style={{ padding: 0 }}>
          <Flex x yc xsb component={Card} fullwidth>
            <Flex x yc gap3>
              <Wallet fontSize="large" />
              <Flex y gap1>
                <Typography level="title-md">Transfer ETH on base</Typography>
              </Flex>
            </Flex>
          </Flex>
        </Button>
      )}

      <Button variant="plain" onClick={() => openBridgeModal()} fullWidth style={{ padding: 0 }}>
        <Flex x yc xsb component={Card} fullwidth>
          <Flex x yc gap3 fullwidth>
            <SwapHoriz fontSize="large" />
            <Flex y gap1>
              <Typography level="title-md">Bridge from other chains</Typography>
            </Flex>
          </Flex>
        </Flex>
      </Button>

      <Flex y gap2>
        <Button disabled={(balance || 0) < 1000000000000000n} onClick={() => router.push("/onboarding/buykey")}>
          {(balance || 0) < 1000000000000000n ? "Deposit at least 0.001 ETH" : "Continue"}
        </Button>

        <Flex x yc xc gap1 fullwidth>
          <Typography level="body-sm" textAlign="center">
            <Skeleton loading={balanceIsLoading}>builder.fi balance: {formatToDisplayString(balance, 18)} ETH</Skeleton>
          </Typography>
          <IconButton onClick={refetchBalance}>
            <Refresh fontSize="small" htmlColor={theme.palette.neutral[500]} />
          </IconButton>
        </Flex>
      </Flex>
      <Modal open={modalOpen} onClose={closeAndRefresh}>
        <ModalDialog minWidth="400px">
          <Flex x xsb yc>
            <DialogTitle>
              {option === "transfer"
                ? "Transfer ETH on Base to builder.fi wallet"
                : "Bridge crypto from another chain to builder.fi wallet"}
            </DialogTitle>
            <IconButton onClick={closeAndRefresh}>
              <Close />
            </IconButton>
          </Flex>
          <Flex y gap2>
            {option === "transfer" && (
              <>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>1.</strong> Copy your builder.fi wallet address <strong>{shortAddress(address || "")}</strong>{" "}
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(address || "");
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <CopyAll />
                  </IconButton>
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>2.</strong> Go to your wallet (ex: Metamask) or exchange (ex: Coinbase or Binance)
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>3.</strong> Send ETH on the Base network to your builder.fi address
                </Typography>
              </>
            )}
            {option !== "transfer" && (
              <>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>1.</strong> Copy your builder.fi wallet address <strong>{shortAddress(address || "")}</strong>{" "}
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(address || "");
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <CopyAll />
                  </IconButton>
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>2.</strong> Go to{" "}
                  <a href="https://bungee.exchange" target="_blank">
                    bungee.exchange
                  </a>
                  , on desktop or mobile
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>3.</strong> Connect a wallet with funds
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>4.</strong> Click on “+ Add Address” and paste your builder.fi address
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>5.</strong> Pick your preferred source chain and token to bridge
                </Typography>
                <Typography level="body-md" textColor="neutral.600">
                  <strong>6.</strong> Confirm the transaction in your wallet
                </Typography>
              </>
            )}
            <Button sx={{ marginTop: 2 }} onClick={() => closeAndRefresh()}>
              Done
            </Button>
          </Flex>
        </ModalDialog>
      </Modal>
    </Flex>
  );
}
