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
import { useGetTopUsers, useRecommendedUsers, useSearch } from "@/hooks/useUserApi";
import { PersonSearchOutlined, SupervisorAccountOutlined } from "@mui/icons-material";
import { TabPanel, Tabs } from "@mui/joy";
import { useState } from "react";

export default function ExplorePage() {
  const [selectedTab, setSelectedTab] = useState<TabsEnum>("Friends");
  const [searchValue, setSearchValue] = useState("");

  const { user } = useUserContext();
  const { data: users, fetchNextPage, hasNextPage, isLoading: isLoadingMoreUsers, isInitialLoading } = useGetTopUsers();
  const router = useBetterRouter();

  const { isLoading: isLoadingRecommendedUsers, data: recommendedUsers } = useRecommendedUsers(
    user?.wallet as `0x${string}`
  );

  const {
    data,
    isLoading: isSearching,
    fetchNextPage: searchNextPage,
    hasNextPage: searchHasNextPage
  } = useSearch(searchValue);

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
        <TabPanel value="Top">
          {isInitialLoading ? (
            <LoadingPage />
          ) : (
            users?.map(user => (
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
          <LoadMoreButton nextPage={fetchNextPage} isLoading={isLoadingMoreUsers} hidden={hasNextPage} />
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
          {isSearching ? (
            <LoadingPage />
          ) : data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Try searching for users by their username or explore the home screen."
            />
          ) : (
            data?.map(user => (
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
          <LoadMoreButton nextPage={searchNextPage} isLoading={isLoadingMoreUsers} hidden={!searchHasNextPage} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
