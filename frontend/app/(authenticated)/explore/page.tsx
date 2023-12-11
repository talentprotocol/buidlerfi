"use client";
import { ExploreTopBar, TabsEnum } from "@/components/app/explore/exploreTopBar";
import { WelcomeModal } from "@/components/app/welcome-modal";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { PageMessage } from "@/components/shared/page-message";
import { RecommendedUserItem } from "@/components/shared/recommended-user-item";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UserItem } from "@/components/shared/user-item";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useOnchainUsers } from "@/hooks/useBuilderFiApi";
import { useRecommendedUsers, useSearch } from "@/hooks/useUserApi";
import { PersonSearchOutlined, SupervisorAccountOutlined } from "@mui/icons-material";
import { CircularProgress, TabPanel, Tabs } from "@mui/joy";
import { useState } from "react";

export default function ExplorePage() {
  const [selectedTab, setSelectedTab] = useState<TabsEnum>("Friends");
  const [searchValue, setSearchValue] = useState("");

  const { user } = useUserContext();
  const { users, nextPage, isInitialLoading, hasMoreUsers, isLoading: isLoadingMoreUsers } = useOnchainUsers();
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
            <Flex y grow yc xc>
              <CircularProgress />
            </Flex>
          ) : (
            users.map(user => (
              <div key={user.id}>
                <UserItem
                  user={{
                    ...user,
                    avatarUrl: user.avatarUrl || undefined,
                    displayName: user.displayName || undefined
                  }}
                />
              </div>
            ))
          )}
          <LoadMoreButton
            nextPage={nextPage}
            isLoading={isLoadingMoreUsers}
            hidden={isInitialLoading || !hasMoreUsers}
          />
        </TabPanel>
        <TabPanel value="Friends">
          {isLoadingRecommendedUsers ? (
            <Flex y grow yc xc>
              <CircularProgress />
            </Flex>
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
            <Flex y yc xc grow>
              <CircularProgress />
            </Flex>
          ) : data?.length === 0 ? (
            <PageMessage
              icon={<PersonSearchOutlined />}
              title={`No results for "${searchValue}"`}
              text="Try searching for users by their username or explore the home screen."
            />
          ) : (
            data?.map(user => (
              <UserItem
                key={user.id}
                user={{ ...user, avatarUrl: user.avatarUrl || undefined, displayName: user.displayName || undefined }}
              />
            ))
          )}
          <LoadMoreButton nextPage={searchNextPage} isLoading={isLoadingMoreUsers} hidden={!searchHasNextPage} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
