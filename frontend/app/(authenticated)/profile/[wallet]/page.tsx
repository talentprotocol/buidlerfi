"use client";
import { ChatTab } from "@/components/app/[wallet]/chat-tab";
import { Overview } from "@/components/app/[wallet]/overview";
import { TradeKeyModal } from "@/components/app/[wallet]/trade-key-modal";
import { Flex } from "@/components/shared/flex";
import { HolderItem } from "@/components/shared/holder-item";
import { PageMessage } from "@/components/shared/page-message";
import { UserItemFromAddress } from "@/components/shared/user-item";
import { useProfileContext } from "@/contexts/profileContext";
import { useGetHoldings } from "@/hooks/useBuilderFiApi";
import { useGetBuilderInfo } from "@/hooks/useBuilderFiContract";
import { useSocialData } from "@/hooks/useSocialData";
import { isEVMAddress, tryParseBigInt } from "@/lib/utils";
import { Chat, Lock } from "@mui/icons-material";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const { address } = useAccount();
  const socialData = useSocialData(params.wallet);

  const holdings = useGetHoldings(params.wallet);

  const isOwnProfile = address?.toLowerCase() === socialData?.address?.toLowerCase();

  const { sellPrice, refetch, buyPriceAfterFee } = useGetBuilderInfo(socialData.address);

  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");

  const { hasKeys, holders, ownedKeysCount, refetch: refetchProfileInfo } = useProfileContext();

  const isValidWallet = useMemo(() => {
    return isEVMAddress(params.wallet);
  }, [params]);

  useEffect(() => {
    if (!isValidWallet) window.location.replace("/notfound");
  }, [isValidWallet]);

  if (!isValidWallet) return <></>;

  const holderNumber = () => {
    if (holders?.length) {
      return `(${holders?.length})`;
    } else {
      return null;
    }
  };

  const holdingNumber = () => {
    if (holdings.data?.length) {
      return `(${holdings.data?.length})`;
    } else {
      return null;
    }
  };

  return (
    <Flex component={"main"} y grow gap2>
      {buyModalState !== "closed" && (
        <TradeKeyModal
          supporterKeysCount={ownedKeysCount || 0}
          hasKeys={hasKeys}
          sellPrice={sellPrice}
          buyPriceWithFees={buyPriceAfterFee}
          isFirstKey={isOwnProfile && holders?.length === 0}
          side={buyModalState}
          close={async () => {
            await refetch();
            await refetchProfileInfo();
            setBuyModalState("closed");
          }}
          targetBuilderAddress={socialData.address}
        />
      )}

      <Overview setBuyModalState={setBuyModalState} socialData={socialData} isOwnProfile={isOwnProfile} />
      <Tabs defaultValue={"chat"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="chat">Q&A</Tab>
          <Tab value="holders">Holders{holderNumber()}</Tab>
          <Tab value="holding">Holding{holdingNumber()}</Tab>
        </TabList>
        <TabPanel value="chat" sx={{ p: 0 }}>
          <ChatTab socialData={socialData} isOwnProfile={isOwnProfile} onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
        <TabPanel value="holding">
          {holdings.data?.length === 0 && isOwnProfile && (
            <PageMessage
              icon={<Chat />}
              text={"Buy other people's keys to ask them a question and access all answers."}
            />
          )}
          {holdings.data?.map(holdingItem => (
            <UserItemFromAddress
              address={holdingItem.owner.owner as `0x${string}`}
              buyPrice={tryParseBigInt(holdingItem.owner.buyPrice)}
              numberOfHolders={Number(holdingItem.owner.numberOfHolders)}
              key={`home-${holdingItem.id}`}
            />
          ))}
        </TabPanel>
        <TabPanel value="holders">
          {holders?.length === 0 && isOwnProfile && (
            <PageMessage icon={<Lock />} text="Create your keys to allow others to ask you direct questions." />
          )}
          {holders?.map(holdingItem => (
            <HolderItem
              address={holdingItem.holder.owner as `0x${string}`}
              numberOfKeys={Number(holdingItem.heldKeyNumber)}
              holderNumber={Number(holdingItem.supporterNumber)}
              key={`home-${holdingItem.id}`}
            />
          ))}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
