"use client";
import { ExploreTopBar } from "@/components/app/explore/exploreTopBar";
import { Flex } from "@/components/shared/flex";
import { LoadMoreButton } from "@/components/shared/loadMoreButton";
import { LoadingPage } from "@/components/shared/loadingPage";
import { PageMessage } from "@/components/shared/page-message";
import { RecommendedUserItem } from "@/components/shared/recommended-user-item";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useUserContext } from "@/contexts/userContext";
import { useGetNewUsers, useGetTopUsers, useRecommendedUsers, useSearch } from "@/hooks/useUserApi";
import PersonSearchOutlined from "@mui/icons-material/PersonSearchOutlined";
import SupervisorAccountOutlined from "@mui/icons-material/SupervisorAccountOutlined";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import { useEffect, useState } from "react";

const ExploreTabs = ["Top", "New", "Friends"] as const;
export type TabsEnum = (typeof ExploreTabs)[number];

export default function ExplorePage() {
  const [selectedTab, setSelectedTab] = useState<TabsEnum>("Top");
  const [searchValue, setSearchValue] = useState("");

  const { user } = useUserContext();
  const topUsers = useGetTopUsers();
  const newUsers = useGetNewUsers();

  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  const { isLoading: isLoadingRecommendedUsers, data: recommendedUsers } = useRecommendedUsers(
    user?.wallet as `0x${string}`
  );

  const searchUsers = useSearch(searchValue);

  return (
    <Flex component={"main"} y grow>
      <InjectTopBar fullItem={<ExploreTopBar searchValue={searchValue} setSearchValue={setSearchValue} />} />
      <Tabs value={searchValue ? "Search" : selectedTab} onChange={(_, val) => val && setSelectedTab(val as TabsEnum)}>
        <TabList
          sx={{
            backgroundColor: theme => theme.palette.background.body,
            top: "55px",
            position: "sticky",
            display: "flex"
          }}
        >
          {ExploreTabs.map(tab => (
            <Tab key={tab} value={tab} sx={{ width: "33.3%" }}>
              {tab}
            </Tab>
          ))}
        </TabList>
        <TabPanel value="Top">
          {topUsers.isLoading ? (
            <LoadingPage />
          ) : (
            topUsers.data?.map(user => (
              <div key={user.id}>
                <UnifiedUserItem
                  user={user}
                  bio={user.bio || undefined}
                  holdersAndReplies={
                    user.bio
                      ? undefined
                      : {
                          questionsCount: user.numberOfReplies,
                          numberOfHolders: user.numberOfHolders
                        }
                  }
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
                    bio={user.bio || ""}
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
                  questionsCount: user.numberOfReplies,
                  numberOfHolders: user.numberOfHolders
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
                  bio={user.bio || undefined}
                  joinedAndReplies={
                    user.bio
                      ? undefined
                      : {
                          createdAt: user.createdAt,
                          numberOfReplies: user.numberOfReplies
                        }
                  }
                />
              </div>
            ))
          )}
          <LoadMoreButton query={newUsers} />
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
