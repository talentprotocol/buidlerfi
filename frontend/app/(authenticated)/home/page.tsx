"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { WelcomeModal } from "@/components/app/welcome-modal";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetHotQuestions, useGetKeyQuestions, useGetNewQuestions } from "@/hooks/useQuestionsApi";
import { Key } from "@mui/icons-material";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useState } from "react";

export default function Home() {
  const { holding } = useUserContext();
  const router = useBetterRouter();
  const [selectedTab, setSelectedTab] = useState("new");

  const newQuestions = useGetNewQuestions();
  const hotQuestions = useGetHotQuestions();
  const keysQuestions = useGetKeyQuestions();

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
              refetch={newQuestions?.refetch}
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
              refetch={hotQuestions?.refetch}
            />
          ))}
          {<LoadMoreButton query={hotQuestions} />}
        </TabPanel>
        <TabPanel value="keys">
          {keysQuestions.isLoading && <LoadingPage />}
          {keysQuestions.data?.length === 0 ? (
            <PageMessage
              icon={<Key />}
              title="Nothing to show"
              text={
                holding?.length === 0
                  ? "You don't own any keys"
                  : "Questions asked to builders you follow will appear here"
              }
            />
          ) : (
            keysQuestions.data?.map(question => (
              <QuestionEntry
                type="home"
                key={question.id}
                question={question}
                onClick={() => router.push(`/question/${question.id}`)}
                refetch={keysQuestions?.refetch}
              />
            ))
          )}
          {<LoadMoreButton query={keysQuestions} />}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
