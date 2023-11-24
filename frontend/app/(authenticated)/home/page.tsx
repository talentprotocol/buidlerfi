"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItem, UserItemInner } from "@/components/shared/user-item";
import { useUserContext } from "@/contexts/userContext";
import { useGetSocialFollowers } from "@/hooks/useAirstackApi";
import { useOnchainUsers } from "@/hooks/useBuilderFiApi";
import { useCheckUsersExist, useRecommendedUsers } from "@/hooks/useUserApi";
import { shortAddress } from "@/lib/utils";
import { SupervisorAccountOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const { user } = useUserContext();
  const { users, nextPage, isInitialLoading, hasMoreUsers, isLoading: isLoadingMoreUsers } = useOnchainUsers();
  const [selectedTab, setSelectedTab] = useState("friends");

  const { data: socialFollowers, isLoading } = useGetSocialFollowers(user?.socialWallet as `0x${string}`);
  const { data: filteredSocialFollowers } = useCheckUsersExist(
    socialFollowers?.Follower?.flatMap(follower => follower.followerAddress?.addresses)
  );

  const { data: recommendedUsers } = useRecommendedUsers(user?.wallet as `0x${string}`);

  console.log({ wallet: user?.wallet });
  console.log({ recommendedUsers });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isInitialLoading || !hasMoreUsers) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreUsers) {
          nextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isInitialLoading, hasMoreUsers, nextPage]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return (
    <Flex component={"main"} y grow>
      <Tabs defaultValue="top" value={selectedTab} onChange={(_, val) => val && setSelectedTab(val as string)}>
        <TabList tabFlex={1} className="grid w-full grid-cols-2">
          <Tab value="friends">Friends</Tab>
          <Tab value="top">Top</Tab>
        </TabList>
        <TabPanel value="top">
          {isInitialLoading ? (
            <Flex y grow yc xc>
              <CircularProgress />
            </Flex>
          ) : (
            users.map((user, index) => (
              <div key={user.id} ref={users.length === index + 1 ? lastUserElementRef : undefined}>
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
          {!isInitialLoading && !isLoadingMoreUsers && hasMoreUsers && (
            <Flex x xc>
              <Button loading={isLoadingMoreUsers} onClick={() => nextPage()}>
                Load More
              </Button>
            </Flex>
          )}
        </TabPanel>
        <TabPanel value="friends">
          {isLoading ? (
            <Flex y grow yc xc>
              <CircularProgress />
            </Flex>
          ) : (
            <>
              {!recommendedUsers || recommendedUsers.length == 0 ? (
                <PageMessage
                  title="No friends here yet…"
                  icon={<SupervisorAccountOutlined />}
                  text="The wallet you connected is missing Web3 connections (Talent Protocol, lens, farcaster)."
                />
              ) : (
                recommendedUsers.map(user => (
                  <UserItemInner
                    address={user.wallet}
                    avatar={user.avatarUrl || ""}
                    name={user.talentProtocol || user.ens || user.farcaster || user.lens || shortAddress(user.wallet)}
                    isLoading={false}
                    buyPrice={0n}
                    numberOfHolders={0}
                    totalQuestions={!!user.user ? user.user._count.questions : 0}
                    totalReplies={!!user.user ? user.user._count.replies : 0}
                  />
                ))
              )}
            </>
          )}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
