"use client";
import { AirstackUserItem } from "@/components/shared/airstack-user-item";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { UserItem } from "@/components/shared/user-item";
import { useUserContext } from "@/contexts/userContext";
import { useGetSocialFollowers } from "@/hooks/useAirstackApi";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { parseFollower } from "@/lib/airstack/parser";
import { tryParseBigInt } from "@/lib/utils";
import { SupervisorAccountOutlined } from "@mui/icons-material";
import { CircularProgress, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useMemo, useState } from "react";

export default function Home() {
  const { address } = useUserContext();
  const builderfiData = useBuilderFIData();
  const [selectedTab, setSelectedTab] = useState("top");

  const users = useMemo(
    () =>
      [...(builderfiData.data?.shareParticipants || [])]
        .filter(user => Number(user.numberOfHolders) > 0)
        .sort((a, b) => (a.numberOfHolders > b.numberOfHolders ? -1 : 1)),
    [builderfiData]
  );

  const { data: socialFollowers, isLoading } = useGetSocialFollowers(address);
  const followers = useMemo(() => socialFollowers?.Follower.map(f => parseFollower(f)) || [], [socialFollowers]);

  return (
    <Flex component={"main"} y grow>
      <Tabs defaultValue="top" value={selectedTab} onChange={(_, val) => val && setSelectedTab(val as string)}>
        <TabList tabFlex={1} className="grid w-full grid-cols-2">
          <Tab value="top">Top</Tab>
          <Tab value="recommended">Recommended</Tab>
        </TabList>
        <TabPanel value="top">
          {users.map(user => (
            <UserItem
              address={user.owner as `0x${string}`}
              buyPrice={tryParseBigInt(user.buyPrice)}
              numberOfHolders={Number(user.numberOfHolders)}
              key={`home-${user.owner}`}
            />
          ))}
        </TabPanel>
        <TabPanel value="recommended">
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              {followers.length == 0 && (
                <PageMessage
                  title="Missing profiles on your wallet"
                  icon={<SupervisorAccountOutlined />}
                  text="Your wallet is missing lens or farcaster profiles, preventing us from suggesting any builders to you at
            the moment."
                />
              )}
              {followers.map(item => (
                <AirstackUserItem
                  address={item.owner as `0x${string}`}
                  dappName={item.dappName}
                  key={`home-${item.owner}`}
                />
              ))}
            </>
          )}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
