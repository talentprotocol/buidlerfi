"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { WelcomeModal } from "@/components/app/welcome-modal";
import { Flex } from "@/components/shared/flex";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetHoldings } from "@/hooks/useBuilderFiApi";
import { useGetHotQuestions, useGetQuestions } from "@/hooks/useQuestionsApi";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useState } from "react";

export default function Home() {
  const { user } = useUserContext();
  const router = useBetterRouter();
  const [selectedTab, setSelectedTab] = useState("new");

  const { data: newQuestions } = useGetQuestions(
    { orderBy: { createdAt: "desc" } },
    { enabled: selectedTab === "new" }
  );
  const { data: hotQuestions } = useGetHotQuestions({ enabled: selectedTab === "hot" });

  const { data: allHolding } = useGetHoldings(user?.wallet as `0x${string}`);
  const { data: keysQuestions } = useGetQuestions({
    orderBy: { createdAt: "desc" },
    where: {
      replier: {
        wallet: { in: allHolding?.map(holding => holding.owner.owner).filter(wallet => wallet !== user?.wallet) }
      }
    }
  });

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar />
      {router.searchParams.welcome === "1" && <WelcomeModal />}
      <Tabs defaultValue="new" value={selectedTab} onChange={(_, val) => val && setSelectedTab(val as string)}>
        <TabList tabFlex={1} className="grid w-full grid-cols-2">
          <Tab value="new">New</Tab>
          <Tab value="hot">Top</Tab>
          <Tab value="keys">Keys</Tab>
        </TabList>
        <TabPanel value="new">
          {newQuestions?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() =>
                router.push({
                  pathname: `profile/${question.replier?.wallet}`,
                  searchParams: { question: question.id }
                })
              }
            />
          ))}
        </TabPanel>
        <TabPanel value="hot">
          {hotQuestions?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`profile/${question.replier?.wallet}/questions/${question.id}`)}
            />
          ))}
        </TabPanel>
        <TabPanel value="keys">
          {keysQuestions?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`profile/${question.replier?.wallet}/questions/${question.id}`)}
            />
          ))}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
