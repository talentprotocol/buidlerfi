"use client";
import { ExportIcon } from "@/components/icons/export";
import { Flex } from "@/components/shared/flex";
import { FundWalletModal } from "@/components/shared/fundTransferModal";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { RoundButton } from "@/components/shared/roundButton";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UserItemFromAddress } from "@/components/shared/user-item";
import { WalletAddress } from "@/components/shared/wallet-address";
import { WithdrawDialog } from "@/components/shared/withdraw-modal";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useBuilderFIData, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { formatToDisplayString, tryParseBigInt } from "@/lib/utils";
import { ArrowDownwardOutlined, ArrowUpwardOutlined, KeyOutlined } from "@mui/icons-material";
import { Button, DialogTitle, Divider, Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import { Transak, TransakConfig } from "@transak/transak-sdk";
import { useMemo, useState } from "react";
import { useBalance } from "wagmi";

export default function ChatsPage() {
  const { user } = useUserContext();
  const [fundModalType, setFundModalType] = useState<"deposit" | "transfer" | "bridge" | "none">("none");

  const router = useBetterRouter();

  const mainWallet = user?.wallet;

  const { data: builderFiData, isLoading } = useBuilderFIData();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: mainWallet as `0x${string}`,
    enabled: !!mainWallet
  });
  const { data: allHolding } = useGetHoldings(mainWallet as `0x${string}`);
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false);

  const [portfolio, tradingFees] = useMemo(() => {
    if (!allHolding || !builderFiData) return [BigInt(0), BigInt(0)];
    const holding = allHolding.reduce((prev, curr) => prev + tryParseBigInt(curr.owner.sellPrice), BigInt(0));
    const tradingFees = builderFiData.shareParticipants.find(
      user => user.owner == mainWallet?.toLowerCase()
    )?.tradingFeesAmount;
    return [holding, tradingFees];
  }, [mainWallet, allHolding, builderFiData]);

  if (isLoading) {
    return <LoadingPage />;
  }

  const openTransak = () => {
    const transakConfig: TransakConfig = {
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_KEY || "", // (Required)
      environment: Transak.ENVIRONMENTS.PRODUCTION,
      defaultNetwork: "base",
      network: "base",
      walletAddress: mainWallet,
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
      <InjectTopBar title="Wallet" withBack />
      <Flex y xc p={2} gap2>
        <img src={LOGO_BLUE_BACK} width="40px" alt="builderfi logo" />
        <Flex y xc>
          <Typography fontWeight="600" textAlign={"center"} level="body-sm">
            Builderfi balance
          </Typography>
          <Typography textAlign={"center"} level="h2" lineHeight="150%">
            {formatToDisplayString(balance?.value, balance?.decimals)} ETH
          </Typography>
          {!!mainWallet && <WalletAddress address={mainWallet} level="body-sm" />}
        </Flex>
      </Flex>
      <Flex x xc gap3>
        <RoundButton variant="soft" icon={<ExportIcon />} title={"Bridge"} onClick={() => setFundModalType("bridge")} />
        <RoundButton
          variant="soft"
          icon={<ArrowUpwardOutlined />}
          title={"Withdraw"}
          onClick={() => setOpenWithdraw(true)}
        />
        <RoundButton icon={<ArrowDownwardOutlined />} title={"Deposit"} onClick={() => setFundModalType("deposit")} />
      </Flex>
      <Flex y p={2}>
        <Button
          variant="soft"
          color="neutral"
          fullWidth
          size="lg"
          sx={{ borderRadius: "5px 5px 0 0", display: "flex", justifyContent: "space-between" }}
          onClick={() => router.push("/wallet/portfolio")}
        >
          <Typography level="title-md">Portfolio value</Typography>
          <Typography fontWeight={300} level="body-sm">
            {formatToDisplayString(portfolio, 18)} ETH
          </Typography>
        </Button>
        <Divider />
        <Button
          variant="soft"
          color="neutral"
          fullWidth
          size="lg"
          sx={{ borderRadius: "0 0 5px 5px", display: "flex", justifyContent: "space-between" }}
          onClick={() => router.push("/wallet/fees")}
        >
          <Typography level="title-md">Fees earned</Typography>
          <Typography fontWeight={300} level="body-sm">
            {formatToDisplayString(tradingFees, 18)} ETH
          </Typography>
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
      {fundModalType === "deposit" && (
        <Modal open onClose={() => setFundModalType("none")}>
          <ModalDialog minWidth="400px">
            <DialogTitle>Deposit</DialogTitle>
            <ModalClose />
            <Typography level="body-md" textColor="neutral.600">
              Choose your preferred method
            </Typography>
            <Button size="lg" onClick={() => setFundModalType("transfer")}>
              Deposit with crypto
            </Button>
            <Button
              size="lg"
              onClick={() => {
                setFundModalType("none");
                openTransak();
              }}
              variant="soft"
            >
              Deposit with fiat
            </Button>
          </ModalDialog>
        </Modal>
      )}
      {(fundModalType === "transfer" || fundModalType === "bridge") && (
        <FundWalletModal
          address={mainWallet}
          close={() => {
            setFundModalType("none");
            refetchBalance();
          }}
          type={fundModalType}
        />
      )}
    </Flex>
  );
}
