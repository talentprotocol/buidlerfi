"use client";

import { FeesIcon } from "@/components/icons/fees";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { TransactionEntry } from "@/components/shared/transaction-entry";
import { useGetTransactions } from "@/hooks/useTransaction";
import { useUsdPrice } from "@/hooks/useUsdPrice";
import { formatToDisplayString, sortIntoPeriods } from "@/lib/utils";
import { HistoryOutlined } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import { useMemo } from "react";

export default function FeesPage() {
  const myTransactions = useGetTransactions("owner");
  const sortedTransactions = sortIntoPeriods(myTransactions.data || []);

  const tradingFees = useMemo(() => {
    return myTransactions.data?.reduce((prev, curr) => prev + BigInt(curr.ownerFee || 0), BigInt(0));
  }, [myTransactions]);

  const { formattedString } = useUsdPrice({ ethAmountInWei: tradingFees });

  return (
    <Flex y grow component="main" gap1>
      <InjectTopBar withBack title="Fees" />
      <Flex x yc gap1 p={2}>
        <Flex
          y
          xc
          yc
          width="40px"
          height="40px"
          borderRadius="20px"
          sx={{ backgroundColor: theme => theme.palette.primary.softBg }}
        >
          <FeesIcon fontSize="xl" sx={{ color: theme => theme.palette.primary[400] }} />
        </Flex>
        <Flex y>
          <Typography className="remove-text-transform" level="h4">
            {formatToDisplayString(tradingFees, 18, 5)} ETH
          </Typography>
          <Typography level="body-sm">${formattedString}</Typography>
        </Flex>
      </Flex>

      {myTransactions.isLoading ? (
        <LoadingPage />
      ) : !myTransactions || myTransactions.data?.length === 0 ? (
        <PageMessage
          icon={<HistoryOutlined />}
          title="No transaction history"
          text="This space is where you'll find all your transactions history."
        />
      ) : (
        <>
          {Object.keys(sortedTransactions)
            .filter(key => sortedTransactions[key as keyof typeof sortedTransactions].length > 0)
            .map(key => {
              return (
                <Flex y key={key}>
                  <Typography sx={{ px: 2, py: 1 }}>{key}</Typography>
                  {sortedTransactions[key as keyof typeof sortedTransactions]?.map(transaction => {
                    return (
                      <TransactionEntry key={transaction.id} transaction={transaction} type="your" feeType="fee" />
                    );
                  })}
                </Flex>
              );
            })}
          <LoadMoreButton query={myTransactions} />
        </>
      )}
    </Flex>
  );
}
