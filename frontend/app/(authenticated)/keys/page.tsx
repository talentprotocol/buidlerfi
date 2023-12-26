"use client";
import { WelcomeModal } from "@/components/app/welcome-modal";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { TransactionEntry } from "@/components/shared/transaction-entry";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetFriendsTransactions, useGetTransactions } from "@/hooks/useTransaction";
import { sortIntoPeriods } from "@/lib/utils";
import { HistoryOutlined } from "@mui/icons-material";
import { Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { useState } from "react";

export default function KeysPage() {
  const router = useBetterRouter();
  const [selectedTab, setSelectedTab] = useState("you");

  const myTransactions = useGetTransactions("both");
  const sortedTransactions = sortIntoPeriods(
    myTransactions.data?.map(tx => ({ ...tx, createdAt: new Date(tx.timestamp ? Number(tx.timestamp) * 1000 : 0) })) ||
      []
  );

  const allTransactions = useGetTransactions("all");
  const sortedAllTransactions = sortIntoPeriods(
    allTransactions.data?.map(tx => ({ ...tx, createdAt: new Date(tx.timestamp ? Number(tx.timestamp) * 1000 : 0) })) ||
      []
  );

  const friendsTransactions = useGetFriendsTransactions();
  const sortedFriendsTransactions = sortIntoPeriods(
    friendsTransactions.data?.map(tx => ({
      ...tx,
      createdAt: new Date(tx.timestamp ? Number(tx.timestamp) * 1000 : 0)
    })) || []
  );

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar />
      {router.searchParams.welcome === "1" && <WelcomeModal />}
      <Tabs defaultValue="you" value={selectedTab} onChange={(_, val) => val && setSelectedTab(val as string)}>
        <TabList tabFlex={1} className="grid w-full grid-cols-2">
          <Tab value="you">You</Tab>
          <Tab value="global">Global</Tab>
          <Tab value="friends">Friends</Tab>
        </TabList>
        <TabPanel value="you">
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
                          <TransactionEntry
                            key={transaction.id}
                            transaction={transaction}
                            type="global"
                            feeType="price"
                          />
                        );
                      })}
                    </Flex>
                  );
                })}
              <LoadMoreButton query={myTransactions} />
            </>
          )}
        </TabPanel>
        <TabPanel value="global">
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
                      <Typography sx={{ px: 2, py: 1 }}>{key}</Typography>
                      {sortedAllTransactions[key as keyof typeof sortedAllTransactions]?.map(transaction => {
                        return (
                          <TransactionEntry
                            key={transaction.id}
                            transaction={transaction}
                            type="global"
                            feeType="price"
                          />
                        );
                      })}
                    </Flex>
                  );
                })}
              <LoadMoreButton query={allTransactions} />
            </>
          )}
        </TabPanel>
        <TabPanel value="friends">
          {friendsTransactions.isLoading ? (
            <LoadingPage />
          ) : !friendsTransactions || friendsTransactions.data?.length === 0 ? (
            <PageMessage
              icon={<HistoryOutlined />}
              title="No friends transaction history"
              text="This space is where you'll find your friends' transactions history."
            />
          ) : (
            <>
              {Object.keys(sortedFriendsTransactions)
                .filter(key => sortedFriendsTransactions[key as keyof typeof sortedFriendsTransactions].length > 0)
                .map(key => {
                  return (
                    <Flex y key={key}>
                      <Typography sx={{ px: 2, py: 1 }}>{key}</Typography>
                      {sortedFriendsTransactions[key as keyof typeof sortedFriendsTransactions]?.map(transaction => {
                        return (
                          <TransactionEntry
                            key={transaction.id}
                            transaction={transaction}
                            type="global"
                            feeType="price"
                          />
                        );
                      })}
                    </Flex>
                  );
                })}
              <LoadMoreButton query={friendsTransactions} />
            </>
          )}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
