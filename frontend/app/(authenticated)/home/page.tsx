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
import { useCreateUser } from "@/hooks/useUserApi";
import { Key } from "@mui/icons-material";
import { Button, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useLogin } from "@privy-io/react-auth";
import { useEffect } from "react";

const tabs = ["New", "Top", "Your holdings"];

export default function Home() {
  const { holding, isAuthenticatedAndActive, refetch } = useUserContext();
  const router = useBetterRouter();
  const createUser = useCreateUser();
  const { login } = useLogin({
    async onComplete(user) {
      if (user) {
        await createUser.mutateAsync();
        await refetch();
      }
    }
  });
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
            display: "flex",
            justifyContent: "stretch"
            // overflow: "auto",
            // scrollSnapType: "x mandatory",
            // "&::-webkit-scrollbar": { display: "none" }
          }}
        >
          {tabs.map(tab => (
            <Tab
              key={tab}
              sx={{ flexGrow: 1 }}
              value={tab}
              disabled={tab === "Your holdings" && !isAuthenticatedAndActive}
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
