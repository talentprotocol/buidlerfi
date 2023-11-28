"use client";
import { AskQuestionModal } from "@/components/app/[wallet]/ask-question-modal";
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
import { isEVMAddress, tryParseBigInt } from "@/lib/utils";
import { Chat, Lock } from "@mui/icons-material";
import { Button, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const {
    hasKeys,
    holders,
    ownedKeysCount,
    refetch: refetchProfileInfo,
    socialData,
    isOwnProfile
  } = useProfileContext();

  const holdings = useGetHoldings(params.wallet);

  const { sellPrice, refetch, buyPriceAfterFee } = useGetBuilderInfo(socialData?.wallet);

  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

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

  console.log({
    width: window.innerWidth,
    diff: window.innerWidth - 500,
    computedRight: (window.innerHeight - 500) / 2 + 37 + 16
  });

  return (
    <Flex component={"main"} y grow gap2>
      {hasKeys && !isOwnProfile && (
        <Flex
          x
          xe
          ye
          sx={{
            pointerEvents: "none",
            zIndex: 3,
            position: "fixed",
            width: "min(100vw, 500px)",
            left: "50%",
            transform: "translateX(-50%)",
            top: 0,
            bottom: 0,
            mb: 2,
            pr: 4
          }}
        >
          <Button sx={{ pointerEvents: "auto" }} size="lg" onClick={() => setIsAskingQuestion(true)}>
            Ask
          </Button>
        </Flex>
      )}
      {isAskingQuestion && (
        <AskQuestionModal refetch={() => refetchProfileInfo()} close={() => setIsAskingQuestion(false)} />
      )}
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
          targetBuilderAddress={socialData.wallet}
        />
      )}

      <Overview setBuyModalState={setBuyModalState} />
      <Tabs defaultValue={"chat"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="chat">Q&A</Tab>
          <Tab value="holders">Holders{holderNumber()}</Tab>
          <Tab value="holding">Holding{holdingNumber()}</Tab>
        </TabList>
        <TabPanel value="chat" sx={{ p: 0 }}>
          <ChatTab onBuyKeyClick={() => setBuyModalState("buy")} />
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
