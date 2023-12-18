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

  const {
    data: newQuestions,
    isLoading: newIsLoading,
    hasNextPage: newHasNextPage,
    fetchNextPage: fetchNewNextPage
  } = useGetQuestions({ orderBy: { createdAt: "desc" } }, { enabled: selectedTab === "new" });
  const {
    data: hotQuestions,
    isLoading: hotIsLoading,
    hasNextPage: hotHasNextPage,
    fetchNextPage: fetchHotNextPage
  } = useGetHotQuestions({ enabled: selectedTab === "hot" });

  const {
    data: keysQuestions,
    fetchNextPage: fetchKeysNextPage,
    isLoading: keysIsLoading,
    hasNextPage: keysHasNextPage
  } = useGetQuestions({
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
          {newIsLoading && <LoadingPage />}
          {newQuestions?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`/question/${question.id}`)}
            />
          ))}
          {<LoadMoreButton isLoading={newIsLoading} nextPage={fetchNewNextPage} hidden={!newHasNextPage} />}
        </TabPanel>
        <TabPanel value="hot">
          {hotIsLoading && <LoadingPage />}
          {hotQuestions?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`/question/${question.id}`)}
            />
          ))}
          {<LoadMoreButton isLoading={hotIsLoading} nextPage={fetchHotNextPage} hidden={!hotHasNextPage} />}
        </TabPanel>
        <TabPanel value="keys">
          {keysIsLoading && <LoadingPage />}
          {keysQuestions?.map(question => (
            <QuestionEntry
              type="home"
              key={question.id}
              question={question}
              onClick={() => router.push(`/question/${question.id}`)}
            />
          ))}
          {<LoadMoreButton isLoading={keysIsLoading} nextPage={fetchKeysNextPage} hidden={!keysHasNextPage} />}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
