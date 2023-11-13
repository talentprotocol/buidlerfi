"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItem } from "@/components/shared/user-item";
import { useBuilderFIData, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { formatToDisplayString, tryParseBigInt } from "@/lib/utils";
import { KeyOutlined, TransitEnterexitOutlined } from "@mui/icons-material";
import { Card, CircularProgress, Divider, Typography, useTheme } from "@mui/joy";
import { useMemo } from "react";
import { useAccount, useBalance } from "wagmi";

export default function ChatsPage() {
  const { address } = useAccount();
  const theme = useTheme();
  const { data: builderFiData, isLoading } = useBuilderFIData();
  const { data: balance } = useBalance({
    address
  });
  const { data: allHolding } = useGetHoldings(address);

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

  return (
    <Flex y grow gap2 component={"main"}>
      <Flex y p={2} mt={1}>
        <Typography textAlign={"center"} level="h2">
          {formatToDisplayString(balance?.value, balance?.decimals)} ETH
        </Typography>
        <Typography textAlign={"center"} level="body-sm">
          Wallet balance
        </Typography>
      </Flex>

      <Flex x gap2 ys px={2}>
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
            <UserItem
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
