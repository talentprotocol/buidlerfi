"use client";
import { Overview } from "@/components/app/[wallet]/overview";
import { ProfileContextMenu } from "@/components/app/[wallet]/profile-context-menu";
import { QuestionsList } from "@/components/app/[wallet]/questions-list";
import { TradeKeyModal } from "@/components/app/[wallet]/trade-key-modal";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUserProfile } from "@/hooks/useUserProfile";
import { isEVMAddress } from "@/lib/utils";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import { useEffect, useMemo } from "react";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const profile = useUserProfile(params.wallet);
  const router = useBetterRouter();
  const tradeModal = router.searchParams.tradeModal;
  const side = tradeModal === "buy" ? "buy" : "sell";

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  const isValidWallet = useMemo(() => {
    return isEVMAddress(params.wallet);
  }, [params]);

  useEffect(() => {
    if (!isValidWallet) window.location.replace("/notfound");
  }, [isValidWallet, router.searchParams]);

  if (!isValidWallet) return <></>;
  return (
    <Flex component={"main"} y grow>
      <InjectTopBar
        withBack
        title={profile.user?.displayName || undefined}
        endItem={<ProfileContextMenu profile={profile.user} />}
      />
      {(tradeModal == "buy" || tradeModal == "sell") && profile.user && (
        <TradeKeyModal
          keyOwner={profile.user}
          supporterKeysCount={profile.ownedKeysCount || 0}
          hasKeys={profile.hasKeys}
          isFirstKey={profile.isOwnProfile && profile.holders?.length === 0}
          side={side}
          close={async () => {
            router.replace({ searchParams: { tradeModal: undefined } });
            profile.refetch();
          }}
        />
      )}
      <Overview profile={profile} />
      <Tabs defaultValue={"answers"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="answers">{profile.questionsAnswered?.length} Answers</Tab>
          <Tab value="questions">{profile.questionsAsked?.length} Questions</Tab>
        </TabList>
        <TabPanel value="answers" sx={{ p: 0 }}>
          <QuestionsList profile={profile} type="answers" />
        </TabPanel>
        <TabPanel value="questions" sx={{ p: 0 }}>
          <QuestionsList profile={profile} type="questions" />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
