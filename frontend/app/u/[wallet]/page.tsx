"use client";
import { Flex } from "@/components/flex";
import { UserItem } from "@/components/user-item";
import { useGetHolders, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { useSocialData } from "@/hooks/useSocialData";
import { tryParseBigInt } from "@/lib/utils";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useState } from "react";
import { ChatTab } from "./components/chat-tab";
import { Overview } from "./components/overview";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const socialData = useSocialData(params.wallet);
  const [selectedTab, setSelectedTab] = useState("chat");

  const holders = useGetHolders(params.wallet);
  const holdings = useGetHoldings(params.wallet);

  return (
    <Flex component={"main"} y grow gap2 sx={{ p: { sm: 0, md: 2 } }}>
      <Overview socialData={socialData} />
      <Tabs value={selectedTab} onChange={(_, val) => val && setSelectedTab(val as string)} sx={{ flexGrow: 1 }}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab disableIndicator value="chat">
            Chat
          </Tab>
          <Tab disableIndicator value="holding">
            Holding ({holdings.data?.length})
          </Tab>
          <Tab disableIndicator value="holders">
            Holders ({holders.data?.length})
          </Tab>
        </TabList>
        <TabPanel value="chat" sx={{ display: selectedTab === "chat" ? "flex" : "none", flexGrow: 1 }}>
          <ChatTab socialData={socialData} />
        </TabPanel>
        <TabPanel value="holding">
          {holdings.data?.map(holdingItem => (
            <UserItem
              address={holdingItem.owner.owner as `0x${string}`}
              buyPrice={tryParseBigInt(holdingItem.owner.buyPrice)}
              numberOfHolders={Number(holdingItem.owner.numberOfHolders)}
              key={`home-${holdingItem.id}`}
            />
          ))}
        </TabPanel>
        <TabPanel value="holders">
          {holders.data?.map(holdingItem => (
            <UserItem
              address={holdingItem.holder.owner as `0x${string}`}
              buyPrice={tryParseBigInt(holdingItem.owner.buyPrice)}
              numberOfHolders={Number(holdingItem.owner.numberOfHolders)}
              key={`home-${holdingItem.id}`}
            />
          ))}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
