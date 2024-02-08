"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { TopicOverview } from "@/components/app/[wallet]/topic-overview";
import { TradeTopicKeyModal } from "@/components/app/[wallet]/trade-topic-key-modal";
import { Flex } from "@/components/shared/flex";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useTopic } from "@/hooks/useTopicsAPI";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AccessTimeOutlined } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { useEffect, useState } from "react";

export default function TopicPage({ params }: { params: { id: string } }) {
  const { user: currentUser } = useUserContext();
  const profile = useUserProfile(currentUser?.wallet);
  const topic = useTopic(params.id);
  const [buyModalState, setBuyModalState] = useState<"closed" | "buy" | "sell">("closed");

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar withBack title={topic?.data?.name || undefined} endItem={<Button>test</Button>} />
      {buyModalState !== "closed" && profile.user && (
        <TradeTopicKeyModal
          topic={topic}
          topicKeysHoldingCount={
            profile.topicHoldings?.filter(t => t.topicId.toString() === topic.data?.id.toString()).length || 0
          }
          hasKeys={profile.hasKeys}
          isFirstKey={profile.isOwnProfile && profile.holders?.length === 0}
          side={buyModalState}
          close={async () => {
            await profile.refetch();
            setBuyModalState("closed");
          }}
        />
      )}
      {topic.isLoading && <LoadingPage />}
      {!topic.isLoading && topic?.data?.questions.length === 0 && (
        <Flex y grow>
          <PageMessage
            title={"no questions to show"}
            icon={<AccessTimeOutlined />}
            text={"maybe you should be the first asking a question in this topic!"}
          />
        </Flex>
      )}
      <TopicOverview topic={topic} setBuyModalState={setBuyModalState} />
      {topic.data?.questions?.map((question: any) => (
        <QuestionEntry key={question?.id} question={question} refetch={topic?.refetch} />
      ))}
      {/* <QuestionsList profile={profile} onBuyKeyClick={() => setBuyModalState("buy")} type="questions" /> */}
      {/* <Overview profile={profile} setBuyModalState={setBuyModalState} />
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
      </Tabs> */}
    </Flex>
  );
}
