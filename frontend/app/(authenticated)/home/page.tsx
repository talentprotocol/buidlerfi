"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItem, UserItemFromAddress } from "@/components/shared/user-item";
import { useUserContext } from "@/contexts/userContext";
import { useGetSocialFollowers } from "@/hooks/useAirstackApi";
import { useOnchainUsers } from "@/hooks/useBuilderFiApi";
import { useCheckUsersExist } from "@/hooks/useUserApi";
import { SupervisorAccountOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const { user } = useUserContext();
  const { users, nextPage, isInitialLoading, hasMoreUsers, isLoading: isLoadingMoreUsers } = useOnchainUsers();
  const [selectedTab, setSelectedTab] = useState("top");

  const { data: socialFollowers, isLoading } = useGetSocialFollowers(user?.socialWallet as `0x${string}`);
  const { data: filteredSocialFollowers } = useCheckUsersExist(
    socialFollowers?.Follower?.flatMap(follower => follower.followerAddress?.addresses)
  );

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
          <Tab value="top">Top</Tab>
          <Tab value="recommended">Recommended</Tab>
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
          {!isInitialLoading && hasMoreUsers && (
            <Flex x xc>
              <Button loading={isLoadingMoreUsers} onClick={() => nextPage()}>
                Load More
              </Button>
            </Flex>
          )}
        </TabPanel>
        <TabPanel value="recommended">
          {isLoading ? (
            <Flex y grow yc xc>
              <CircularProgress />
            </Flex>
          ) : (
            <>
              {!filteredSocialFollowers || filteredSocialFollowers.length == 0 ? (
                <PageMessage
                  title="No friends here yet…"
                  icon={<SupervisorAccountOutlined />}
                  text="Either the wallet you connected is missing Lens and Farcaster profiles, or none of your friends is using builder.fi yet."
                />
              ) : (
                filteredSocialFollowers.map(user => (
                  <UserItemFromAddress address={user.wallet as `0x${string}`} key={`home-${user.wallet}`} />
                ))
              )}
            </>
          )}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
