"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItem } from "@/components/shared/user-item";
import { useUserContext } from "@/contexts/userContext";
import { useGetSocialFollowers } from "@/hooks/useAirstackApi";
import { useOnchainUsers } from "@/hooks/useBuilderFiApi";
import { useCheckUsersExist } from "@/hooks/useUserApi";
import { THE_GRAPH_PAGE_SIZE } from "@/lib/constants";
import { tryParseBigInt } from "@/lib/utils";
import { Share } from "@/models/share.model";
import { SupervisorAccountOutlined } from "@mui/icons-material";
import { Button, CircularProgress, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const { user } = useUserContext();
  const [allUsers, setAllUsers] = useState<Share[]>([]);
  const { data: usersPaginated, nextPage, isInitialLoading } = useOnchainUsers();
  const [selectedTab, setSelectedTab] = useState("top");

  useEffect(() => {
    if (!usersPaginated) return;
    if (allUsers.length === 0) {
      setAllUsers(usersPaginated.shareParticipants);
    } else {
      setAllUsers(prev => [...prev, ...usersPaginated.shareParticipants]);
    }
  }, [usersPaginated]);

  const users = useMemo(() => [...(allUsers || [])].filter(user => Number(user.numberOfHolders) > 0), [allUsers]);

  const { data: socialFollowers, isLoading } = useGetSocialFollowers(user?.socialWallet as `0x${string}`);
  const { data: filteredSocialFollowers } = useCheckUsersExist(
    socialFollowers?.Follower?.flatMap(follower => follower.followerAddress.addresses)
  );

  const showLoadMore = () => {
    if (!usersPaginated?.shareParticipants) {
      return false;
    } else if ((usersPaginated?.shareParticipants?.length || 0) < THE_GRAPH_PAGE_SIZE) {
      return false;
    } else {
      return true;
    }
  };

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
            users.map(user => (
              <UserItem
                address={user.owner as `0x${string}`}
                buyPrice={tryParseBigInt(user.buyPrice)}
                numberOfHolders={Number(user.numberOfHolders)}
                key={`home-${user.owner}`}
              />
            ))
          )}
          {showLoadMore() && (
            <Flex x xc>
              <Button onClick={() => nextPage()}>Load More</Button>
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
                  text="- Either the wallet you connected is missing Lens and Farcaster profiles, or none of your friends is using [builder.fi](http://builder.fi) yet."
                />
              ) : (
                filteredSocialFollowers.map(user => (
                  <UserItem address={user.wallet as `0x${string}`} key={`home-${user.wallet}`} />
                ))
              )}
            </>
          )}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
