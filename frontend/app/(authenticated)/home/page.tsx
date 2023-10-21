"use client";
import { AirstackUserItem } from "@/components/shared/airstack-user-item";
import { Flex } from "@/components/shared/flex";
import { Icons } from "@/components/shared/ui/icons";
import { UserItem } from "@/components/shared/user-item";
import { useGetSocialFollowers } from "@/hooks/useAirstackApi";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { parseFollower } from "@/lib/airstack/parser";
import { tryParseBigInt } from "@/lib/utils";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { Wallet } from "lucide-react";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const builderfiData = useBuilderFIData();

  const users = useMemo(
    () =>
      [...(builderfiData.data?.shareParticipants || [])].sort((a, b) =>
        a.numberOfHolders > b.numberOfHolders ? -1 : 1
      ),
    [builderfiData]
  );

  const { data: socialFollowers } = useGetSocialFollowers(address);
  const followers = useMemo(() => socialFollowers?.Follower.map(f => parseFollower(f)) || [], [socialFollowers]);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Icons.spinner className="text-muted-foreground h-32 w-32 animate-spin mb-6" />
        <p>Connecting...</p>
      </div>
    );
  }

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <Wallet className="text-muted-foreground h-32 w-32 mb-6" />
        <p>Please connect your wallet to proceed.</p>
      </div>
    );
  }

  return (
    <Flex component={"main"} y grow>
      <Tabs defaultValue="top" className="space-y-4">
        <TabList tabFlex={1} className="grid w-full grid-cols-2">
          <Tab variant="soft" disableIndicator value="top">
            Top
          </Tab>
          <Tab variant="soft" disableIndicator value="recommended">
            Recommended
          </Tab>
        </TabList>
        <TabPanel value="top" sx={{ p: 0 }} className="space-y-2">
          {users.map(user => (
            <UserItem
              address={user.owner as `0x${string}`}
              buyPrice={tryParseBigInt(user.buyPrice)}
              numberOfHolders={Number(user.numberOfHolders)}
              key={`home-${user.owner}`}
            />
          ))}
        </TabPanel>
        <TabPanel value="recommended" className="space-y-4">
          {followers.length == 0 && (
            <div className="flex flex-col items-center justify-center mt-24">
              <Wallet className="text-muted-foreground h-32 w-32 mb-6" />
              <p>We could find any connections to recommend based on your wallet.</p>
            </div>
          )}
          {followers.map(item => (
            <AirstackUserItem
              address={item.owner as `0x${string}`}
              dappName={item.dappName}
              key={`home-${item.owner}`}
            />
          ))}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
