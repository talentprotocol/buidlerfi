"use client";
import { QuestionEntry } from "@/components/app/[wallet]/question-entry";
import { QuestionSearch } from "@/components/app/question/question-search";
import { MaintenanceAlert } from "@/components/layout/maintenance-alert";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useGetHotQuestions, useGetNewQuestions, useGetSearchQuestion } from "@/hooks/useQuestionsApi";
import PersonSearchOutlined from "@mui/icons-material/PersonSearchOutlined";
import Button from "@mui/joy/Button";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import { useLogin } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticatedAndActive } = useUserContext();
  const { login } = useLogin();
  const newQuestions = useGetNewQuestions();
  const hotQuestions = useGetHotQuestions();
  const [searchValue, setSearchValue] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabsEnum>("New");

  // const keysQuestions = useGetKeyQuestions();
  const HomeTabs = ["New", "Top"] as const;
  type TabsEnum = (typeof HomeTabs)[number];

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);
  const searchResult = useGetSearchQuestion(searchValue);
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
        fullItem={
          isAuthenticatedAndActive && (
            <QuestionSearch title="Home" searchValue={searchValue} setSearchValue={setSearchValue} />
          )
        }
      />
      <MaintenanceAlert />
      <Tabs value={searchValue ? "Search" : selectedTab} onChange={(_, val) => val && setSelectedTab(val as TabsEnum)}>
        {!searchValue && (
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
            {HomeTabs.map(tab => (
              <Tab key={tab} value={tab} sx={{ width: "50%" }}>
                {tab}
              </Tab>
            ))}
          </TabList>
        )}
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
        <TabPanel value="Search">
          {searchResult.isLoading ? (
            <LoadingPage />
          ) : searchResult.data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Please try searching another keywords."
            />
          ) : (
            searchResult.data?.map(question => (
              <QuestionEntry key={question?.id} question={question} refetch={hotQuestions?.refetch} />
            ))
          )}
          <LoadMoreButton query={searchResult} />
        </TabPanel>

        {/* <TabPanel value="Your holdings">
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
        </TabPanel> */}
      </Tabs>
    </Flex>
  );
}
