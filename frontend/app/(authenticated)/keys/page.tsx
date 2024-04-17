"use client";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { TransactionEntry } from "@/components/shared/transaction-entry";
import { useGetTransactions } from "@/hooks/useTransaction";
import { sortIntoPeriods } from "@/lib/utils";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import Typography from "@mui/joy/Typography";

export default function KeysPage() {
  const allTransactions = useGetTransactions("all");
  const sortedAllTransactions = sortIntoPeriods(
    allTransactions.data?.map(tx => ({ ...tx, createdAt: new Date(tx.timestamp ? Number(tx.timestamp) * 1000 : 0) })) ||
      []
  );

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar />
      {allTransactions.isLoading ? (
        <LoadingPage />
      ) : !allTransactions || allTransactions.data?.length === 0 ? (
        <PageMessage
          icon={<HistoryOutlined />}
          title="No transaction history"
          text="This space is where you'll find the global transactions history."
        />
      ) : (
        <>
          {Object.keys(sortedAllTransactions)
            .filter(key => sortedAllTransactions[key as keyof typeof sortedAllTransactions].length > 0)
            .map(key => {
              return (
                <Flex y key={key}>
                  <Typography level="body-sm" fontWeight={600} sx={{ px: 2, py: 2 }}>
                    {key}
                  </Typography>
                  {sortedAllTransactions[key as keyof typeof sortedAllTransactions]?.map(transaction => {
                    return (
                      <TransactionEntry key={transaction.id} transaction={transaction} type="global" feeType="price" />
                    );
                  })}
                </Flex>
              );
            })}
          <LoadMoreButton query={allTransactions} />
        </>
      )}
    </Flex>
  );
}
