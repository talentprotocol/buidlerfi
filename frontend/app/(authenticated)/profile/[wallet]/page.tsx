"use client";
import { ChatTab } from "@/components/app/[wallet]/chat-tab";
import { Overview } from "@/components/app/[wallet]/overview";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItem } from "@/components/shared/user-item";
import { useGetHolders, useGetHoldings } from "@/hooks/useBuilderFiApi";
import { useSocialData } from "@/hooks/useSocialData";
import { isEVMAddress, tryParseBigInt } from "@/lib/utils";
import { Chat, Lock } from "@mui/icons-material";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const { address } = useAccount();
  const socialData = useSocialData(params.wallet);

  const holders = useGetHolders(params.wallet);
  const holdings = useGetHoldings(params.wallet);

  const isOwnProfile = address?.toLowerCase() === socialData?.address?.toLowerCase();

  const isValidWallet = useMemo(() => {
    return isEVMAddress(params.wallet);
  }, [params]);

  useEffect(() => {
    if (!isValidWallet) window.location.replace("/notfound");
  }, [isValidWallet]);

  if (!isValidWallet) return <></>;

  return (
    <Flex component={"main"} y grow gap2>
      <Overview socialData={socialData} isOwnProfile={isOwnProfile} />
      <Tabs defaultValue={"chat"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="chat">Q&A</Tab>
          <Tab value="holders">Holders({holders.data?.length})</Tab>
          <Tab value="holding">Holding({holdings.data?.length})</Tab>
        </TabList>
        <TabPanel value="chat" sx={{ p: 0 }}>
          <ChatTab socialData={socialData} isOwnProfile={isOwnProfile} />
        </TabPanel>
        <TabPanel value="holding">
          {holdings.data?.length === 0 && isOwnProfile && (
            <PageMessage
              icon={<Chat />}
              text={"Buy other people's cards to ask them a question and access all answers."}
            />
          )}
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
          {holders.data?.length === 0 && isOwnProfile && (
            <PageMessage
              icon={<Lock />}
              text="Buy the first card to allow others to trade your cards and ask you questions."
            />
          )}
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
