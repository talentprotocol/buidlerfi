"use client";
import { AskQuestionModal } from "@/components/app/[wallet]/ask-question-modal";
import { ChatTab } from "@/components/app/[wallet]/chat-tab";
import { Overview } from "@/components/app/[wallet]/overview";
import { TradeKeyModal } from "@/components/app/[wallet]/trade-key-modal";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useProfileContext } from "@/contexts/profileContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { isEVMAddress } from "@/lib/utils";
import { Chat, Lock } from "@mui/icons-material";
import { Button, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const {
    hasKeys,
    holders,
    holdings,
    ownedKeysCount,
    refetch: refetchProfileInfo,
    socialData,
    isOwnProfile
  } = useProfileContext();
  const router = useBetterRouter();

  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");

  const isValidWallet = useMemo(() => {
    return isEVMAddress(params.wallet);
  }, [params]);

  useEffect(() => {
    if (!isValidWallet) window.location.replace("/notfound");
  }, [isValidWallet]);

  if (!isValidWallet) return <></>;

  return (
    <Flex component={"main"} y grow gap2>
      <InjectTopBar withBack />
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
            bottom: "56px",
            mb: 2,
            pr: 4
          }}
        >
          <Button
            sx={{ pointerEvents: "auto" }}
            size="lg"
            onClick={() => router.replace({ searchParams: { ask: true } })}
          >
            Ask
          </Button>
        </Flex>
      )}
      {router.searchParams.ask && (
        <AskQuestionModal
          refetch={() => refetchProfileInfo()}
          close={() => router.replace({ searchParams: { ask: undefined } })}
        />
      )}
      {buyModalState !== "closed" && (
        <TradeKeyModal
          supporterKeysCount={ownedKeysCount || 0}
          hasKeys={hasKeys}
          isFirstKey={isOwnProfile && holders?.length === 0}
          side={buyModalState}
          close={async () => {
            await refetchProfileInfo();
            setBuyModalState("closed");
          }}
          targetBuilderAddress={socialData?.wallet}
        />
      )}

      <Overview setBuyModalState={setBuyModalState} />
      <Tabs defaultValue={"chat"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="chat">Q&A</Tab>
          <Tab value="holders">Holders ({holders?.length})</Tab>
          <Tab value="holding">Holding ({holdings?.length})</Tab>
        </TabList>
        <TabPanel value="chat" sx={{ p: 0 }}>
          <ChatTab onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
        <TabPanel value="holding">
          {holdings?.length === 0 && isOwnProfile && (
            <PageMessage
              icon={<Chat />}
              text={"Buy other people's keys to ask them a question and access all answers."}
            />
          )}
          {holdings?.length === 0 && !isOwnProfile && (
            <PageMessage icon={<Lock />} text={"This user has not bought any keys yet."} />
          )}
          {holdings?.map((holdingItem, i) => (
            <UnifiedUserItem
              user={holdingItem.owner}
              holderInfo={{
                holderNumber: i + 1,
                numberOfKeys: Number(holdingItem.amount)
              }}
              key={`home-${holdingItem.id}`}
            />
          ))}
        </TabPanel>
        <TabPanel value="holders">
          {holders?.length === 0 && isOwnProfile && (
            <PageMessage icon={<Lock />} text="Create your keys to allow others to ask you direct questions." />
          )}
          {holders?.length === 0 && !isOwnProfile && (
            <PageMessage icon={<Lock />} text="This user hasn't created their keys yet." />
          )}
          {holders?.map((holdingItem, i) => (
            <UnifiedUserItem
              user={holdingItem.holder}
              holderInfo={{
                holderNumber: i + 1,
                numberOfKeys: Number(holdingItem.amount)
              }}
              key={`home-${holdingItem.id}`}
            />
          ))}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
