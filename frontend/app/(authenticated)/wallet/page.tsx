"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItemFromAddress } from "@/components/shared/user-item";
import { WalletAddress } from "@/components/shared/wallet-address";
import { WithdrawDialog } from "@/components/shared/withdraw-modal";
import { useBuilderFIData, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { formatToDisplayString, tryParseBigInt } from "@/lib/utils";
import { KeyOutlined, TransitEnterexitOutlined } from "@mui/icons-material";
import { Button, Card, CircularProgress, Divider, Typography, useTheme } from "@mui/joy";
import { Transak, TransakConfig } from "@transak/transak-sdk";
import { useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";

export default function ChatsPage() {
  const { address } = useAccount();
  const theme = useTheme();
  const { data: builderFiData, isLoading } = useBuilderFIData();
  const { data: balance } = useBalance({
    address
  });
  const { data: allHolding } = useGetHoldings(address);
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false);

  const [portfolio, tradingFees] = useMemo(() => {
    if (!allHolding || !builderFiData) return [BigInt(0), BigInt(0)];
    const holding = allHolding.reduce((prev, curr) => prev + tryParseBigInt(curr.owner.buyPrice), BigInt(0));
    const tradingFees = builderFiData.shareParticipants.find(
      user => user.owner == address?.toLowerCase()
    )?.tradingFeesAmount;
    return [holding, tradingFees];
  }, [address, allHolding, builderFiData]);

  if (isLoading) {
    return (
      <Flex y yc xc grow>
        <CircularProgress />
      </Flex>
    );
  }

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

  return (
    <Flex y grow gap2 component={"main"}>
      {openWithdraw && (
        <WithdrawDialog
          formattedBalance={formatToDisplayString(balance?.value, balance?.decimals)}
          balance={balance?.value || BigInt(0)}
          close={() => setOpenWithdraw(false)}
        />
      )}
      <Flex x gap2 ys px={2} mt={2}>
        <Flex grow component={Card} sx={{ gap: 0 }}>
          <KeyOutlined htmlColor={theme.palette.primary[300]} />
          <Typography level="h4">{formatToDisplayString(portfolio, 18)} ETH</Typography>
          <Typography level="body-sm">Portfolio value</Typography>
        </Flex>
        <Flex grow component={Card} sx={{ gap: 0 }}>
          <TransitEnterexitOutlined htmlColor={theme.palette.primary[300]} />
          <Typography level="h4">{formatToDisplayString(tradingFees, 18)} ETH</Typography>
          <Typography level="body-sm">Fees earned</Typography>
        </Flex>
      </Flex>
      <Flex y xc p={2}>
        <Typography textAlign={"center"} level="body-sm">
          Wallet balance
        </Typography>
        <Typography textAlign={"center"} level="h2">
          {formatToDisplayString(balance?.value, balance?.decimals)} ETH
        </Typography>
        {!!address && <WalletAddress address={address} level="body-md" />}
      </Flex>
      <Flex x xc p={2} gap1>
        <Button
          onClick={() =>
            window.open("https://www.sushi.com/swap/cross-chain?chainId1=8453&token1=NATIVE&swapAmount=0.01")
          }
        >
          Bridge
        </Button>
        <Button variant="soft" onClick={() => setOpenWithdraw(true)}>
          Withdraw
        </Button>
        <Button variant="outlined" onClick={() => openTransak()}>
          Deposit
        </Button>
      </Flex>
      <Divider />
      <Flex y grow px={2}>
        <Typography level="h4" mb={1}>
          {allHolding ? `Holding(${allHolding.length})` : "Holding"}
        </Typography>
        {!allHolding || allHolding?.length === 0 ? (
          <PageMessage
            icon={<KeyOutlined />}
            title="You don't have any keys"
            text="This space is where you'll find all your expert key holdings."
          />
        ) : (
          allHolding.map(item => (
            <UserItemFromAddress
              address={item.owner.owner as `0x${string}`}
              buyPrice={tryParseBigInt(item.owner.buyPrice)}
              numberOfHolders={Number(item.owner.numberOfHolders)}
              key={`home-${item.owner.owner}`}
            />
          ))
        )}
      </Flex>
    </Flex>
  );
}
