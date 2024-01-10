"use client";
import { AskQuestionModal } from "@/components/app/[wallet]/ask-question-modal";
import { Overview } from "@/components/app/[wallet]/overview";
import { QuestionsList } from "@/components/app/[wallet]/questions-list";
import { TradeKeyModal } from "@/components/app/[wallet]/trade-key-modal";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isEVMAddress } from "@/lib/utils";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const profile = useUserProfile(params.wallet);
  const router = useBetterRouter();

  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  const isValidWallet = useMemo(() => {
    return isEVMAddress(params.wallet);
  }, [params]);

  useEffect(() => {
    if (!isValidWallet) window.location.replace("/notfound");
  }, [isValidWallet]);

  if (!isValidWallet) return <></>;

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar withBack title={profile.user?.displayName || undefined} />
      {router.searchParams.ask && (
        <AskQuestionModal
          ownerUser={profile.user}
          refetch={() => profile.refetch()}
          close={() => router.replace({ searchParams: { ask: undefined } })}
        />
      )}
      {buyModalState !== "closed" && (
        <TradeKeyModal
          keyOwner={profile.user}
          supporterKeysCount={profile.ownedKeysCount || 0}
          hasKeys={profile.hasKeys}
          isFirstKey={profile.isOwnProfile && profile.holders?.length === 0}
          side={buyModalState}
          close={async () => {
            await profile.refetch();
            setBuyModalState("closed");
          }}
          targetBuilderAddress={(profile.user?.wallet as `0x${string}`) || undefined}
        />
      )}

      <Overview profile={profile} setBuyModalState={setBuyModalState} />
      <Tabs defaultValue={"answers"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="answers">{profile.questions?.length} Answers</Tab>
          <Tab value="questions">{profile.questionsAsked?.length} Questions</Tab>
        </TabList>
        <TabPanel value="answers" sx={{ p: 0 }}>
          <QuestionsList profile={profile} type="answers" onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
        <TabPanel value="questions" sx={{ p: 0 }}>
          <QuestionsList profile={profile} type="questions" onBuyKeyClick={() => setBuyModalState("buy")} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
