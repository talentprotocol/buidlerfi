"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { WelcomeModal } from "@/components/app/welcome-modal";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetKeyRelationships } from "@/hooks/useKeyRelationshipApi";
import { useGetHotQuestions, useGetQuestions } from "@/hooks/useQuestionsApi";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useState } from "react";

export default function Home() {
  const { user } = useUserContext();
  const router = useBetterRouter();
  const [selectedTab, setSelectedTab] = useState("new");

  const { data: allHolding } = useGetKeyRelationships({
    where: { holderId: user?.id, amount: { gt: 0 } }
  });

  const newQuestions = useGetQuestions({ orderBy: { createdAt: "desc" } }, { enabled: selectedTab === "new" });
  const hotQuestions = useGetHotQuestions({ enabled: selectedTab === "hot" });
  const keysQuestions = useGetQuestions({
    orderBy: { createdAt: "desc" },
    where: {
      replier: {
        id: { in: allHolding?.map(holding => holding.owner.id) }
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
          {newQuestions.isLoading && <LoadingPage />}
          {newQuestions.data?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`/question/${question.id}`)}
            />
          ))}
          {<LoadMoreButton query={newQuestions} />}
        </TabPanel>
        <TabPanel value="hot">
          {hotQuestions.isLoading && <LoadingPage />}
          {hotQuestions.data?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`/question/${question.id}`)}
            />
          ))}
          {<LoadMoreButton query={hotQuestions} />}
        </TabPanel>
        <TabPanel value="keys">
          {keysQuestions.isLoading && <LoadingPage />}
          {keysQuestions.data?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`/question/${question.id}`)}
            />
          ))}
          {<LoadMoreButton query={keysQuestions} />}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
