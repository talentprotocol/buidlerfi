"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetHotQuestions, useGetKeyQuestions, useGetNewQuestions } from "@/hooks/useQuestionsApi";
import Key from "@mui/icons-material/Key";
import Button from "@mui/joy/Button";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import { useLogin } from "@privy-io/react-auth";
import { useEffect } from "react";

const tabs = ["New", "Top", "Your holdings"];

export default function Home() {
  const { holding, isAuthenticatedAndActive } = useUserContext();
  const router = useBetterRouter();
  const { login } = useLogin();
  const tab = router.searchParams.tab as (typeof tabs)[number] | undefined;
  const newQuestions = useGetNewQuestions();
  const hotQuestions = useGetHotQuestions();
  const keysQuestions = useGetKeyQuestions();

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);
  return (
    <Flex component={"main"} y grow>
      <InjectTopBar
        endItem={
          !isAuthenticatedAndActive && (
            <Button variant="plain" size="sm" onClick={() => login()}>
              Sign In
            </Button>
          )
        }
      />
      <Tabs
        sx={{ width: "min(100vw, 500px)" }}
        value={tab || tabs[0]}
        onChange={(_, newTab) => router.replace({ searchParams: { tab: newTab || undefined } })}
      >
        <TabList
          sx={{
            backgroundColor: theme => theme.palette.background.body,
            top: "55px",
            position: "sticky",
            display: "flex"
            // overflow: "auto",
            // scrollSnapType: "x mandatory",
            // "&::-webkit-scrollbar": { display: "none" }
          }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab}
              value={tab}
              disabled={tab === "Your holdings" && !isAuthenticatedAndActive}
              sx={{ width: "33.3%" }}
            >
              {tab}
            </Tab>
          ))}
        </TabList>
        <TabPanel value="New">
          {newQuestions.isLoading && <LoadingPage />}
          {newQuestions.data?.map(question => (
            <QuestionEntry key={question?.id} question={question} refetch={newQuestions?.refetch} />
          ))}
          {<LoadMoreButton query={newQuestions} />}
        </TabPanel>
        <TabPanel value="Top">
          {hotQuestions.isLoading && <LoadingPage />}
          {hotQuestions.data?.map(question => (
            <QuestionEntry key={question?.id} question={question} refetch={hotQuestions?.refetch} />
          ))}
          {<LoadMoreButton query={hotQuestions} />}
        </TabPanel>
        <TabPanel value="Your holdings">
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
              <QuestionEntry key={question?.id} question={question} refetch={keysQuestions?.refetch} />
            ))
          )}
          {<LoadMoreButton query={keysQuestions} />}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
