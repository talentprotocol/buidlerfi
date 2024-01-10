"use client";
import { ExploreTopBar, TabsEnum } from "@/components/app/explore/exploreTopBar";
import { WelcomeModal } from "@/components/app/welcome-modal";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { RecommendedUserItem } from "@/components/shared/recommended-user-item";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import {
  useGetNewUsers,
  useGetTopUsers,
  useGetTopUsersByAnswersGiven,
  useGetTopUsersByKeysOwned,
  useGetTopUsersByQuestionsAsked,
  useRecommendedUsers,
  useSearch
} from "@/hooks/useUserApi";
import { PersonSearchOutlined, SupervisorAccountOutlined } from "@mui/icons-material";
import { TabPanel, Tabs } from "@mui/joy";
import { useEffect, useState } from "react";

export default function ExplorePage() {
  const [selectedTab, setSelectedTab] = useState<TabsEnum>("Friends");
  const [searchValue, setSearchValue] = useState("");

  const { user } = useUserContext();
  const topUsers = useGetTopUsers();
  const newUsers = useGetNewUsers();
  const topUsersByQuestions = useGetTopUsersByQuestionsAsked();
  const topUsersByAnswers = useGetTopUsersByAnswersGiven();
  const topUsersByKeys = useGetTopUsersByKeysOwned();

  const router = useBetterRouter();

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  const { isLoading: isLoadingRecommendedUsers, data: recommendedUsers } = useRecommendedUsers(
    user?.wallet as `0x${string}`
  );

  const searchUsers = useSearch(searchValue);

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar
        fullItem={
          <ExploreTopBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            setSelectedTab={setSelectedTab}
            selectedTab={selectedTab}
          />
        }
      />
      {router.searchParams.welcome === "1" && <WelcomeModal />}
      <Tabs value={searchValue ? "Search" : selectedTab} onChange={(_, val) => val && setSelectedTab(val as TabsEnum)}>
        <TabPanel value="Holders">
          {topUsers.isLoading ? (
            <LoadingPage />
          ) : (
            topUsers.data?.map(user => (
              <div key={user.id}>
                <UnifiedUserItem
                  user={user}
                  holdersAndReplies={{
                    numberOfReplies: user.numberOfReplies,
                    numberOfHolders: user.numberOfHolders,
                    numberOfQuestions: user.numberOfQuestions
                  }}
                />
              </div>
            ))
          )}
          <LoadMoreButton query={topUsers} />
        </TabPanel>
        <TabPanel value="Friends">
          {isLoadingRecommendedUsers ? (
            <LoadingPage />
          ) : (
            <>
              {!recommendedUsers || recommendedUsers.length == 0 ? (
                <PageMessage
                  title="No friends here yet…"
                  icon={<SupervisorAccountOutlined />}
                  text="Either the wallet you connected is missing Lens and Farcaster profiles, or none of your friends is using builder.fi yet."
                />
              ) : (
                recommendedUsers.map(user => (
                  <RecommendedUserItem
                    key={user.wallet}
                    wallet={user.wallet}
                    avatarUrl={user.avatarUrl || undefined}
                    ens={user.ens || ""}
                    lens={user.lens || ""}
                    farcaster={user.farcaster || ""}
                    talentProtocol={user.talentProtocol || ""}
                    replies={user.replies}
                    questions={user.questions}
                    createdAt={user.createdAt}
                    userId={user.userId || 0}
                  />
                ))
              )}
            </>
          )}
        </TabPanel>
        <TabPanel value="Search">
          {searchUsers.isLoading ? (
            <LoadingPage />
          ) : searchUsers.data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Try searching for users by their username or explore the home screen."
            />
          ) : (
            searchUsers.data?.map(user => (
              <UnifiedUserItem
                key={user.id}
                user={user}
                holdersAndReplies={{
                  numberOfReplies: user.numberOfReplies,
                  numberOfHolders: user.numberOfHolders,
                  numberOfQuestions: user.numberOfQuestions
                }}
              />
            ))
          )}
          <LoadMoreButton query={searchUsers} />
        </TabPanel>
        <TabPanel value="New">
          {newUsers.isLoading ? (
            <LoadingPage />
          ) : (
            newUsers.data?.map(user => (
              <div key={user.id}>
                <UnifiedUserItem
                  user={user}
                  joinedAndReplies={{
                    createdAt: user.createdAt,
                    numberOfReplies: user.numberOfReplies,
                    numberOfQuestions: user.numberOfQuestions
                  }}
                />
              </div>
            ))
          )}
          <LoadMoreButton query={newUsers} />
        </TabPanel>
        <TabPanel value="Questions">
          {topUsersByQuestions.isLoading ? (
            <LoadingPage />
          ) : (
            topUsersByQuestions.data?.map(user => (
              <div key={user.id}>
                <UnifiedUserItem
                  user={user}
                  holdersAndReplies={{
                    numberOfHolders: user.numberOfHolders,
                    numberOfReplies: user.questionsAnswered,
                    numberOfQuestions: user.questionsAsked,
                    label: "question"
                  }}
                />
              </div>
            ))
          )}
          <LoadMoreButton query={topUsersByQuestions} />
        </TabPanel>
        <TabPanel value="Answers">
          {topUsersByAnswers.isLoading ? (
            <LoadingPage />
          ) : (
            topUsersByAnswers.data?.map(user => (
              <div key={user.id}>
                <UnifiedUserItem
                  user={user}
                  holdersAndReplies={{
                    numberOfHolders: user.numberOfHolders,
                    numberOfReplies: user.questionsAnswered,
                    numberOfQuestions: user.questionsReceived
                  }}
                />
              </div>
            ))
          )}
          <LoadMoreButton query={topUsersByAnswers} />
        </TabPanel>
        <TabPanel value="Keys">
          {topUsersByKeys.isLoading ? (
            <LoadingPage />
          ) : (
            topUsersByKeys.data?.map(user => (
              <div key={user.id}>
                <UnifiedUserItem
                  user={user}
                  holdersAndKeys={{
                    numberOfHolders: user.numberOfHolders || 0,
                    ownedKeys: user.ownedKeys
                  }}
                />
              </div>
            ))
          )}
          <LoadMoreButton query={topUsersByKeys} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
