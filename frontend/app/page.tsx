"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { UserItem } from "@/components/user-item";
import { useGetSocialFollowers } from "@/hooks/useAirstackApi";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { DEFAULT_PROFILE_PICTURE } from "@/lib/assets";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { ChevronRight, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  const { data: socialFollowers } = useGetSocialFollowers(address);
  const followers = useMemo(
    () =>
      socialFollowers?.Follower.map(follower => ({
        id: follower.followerAddress.identity,
        name:
          follower.followerAddress.domains.find(domain => domain.isPrimary)?.name || follower.followerAddress.identity,
        dappName: follower.dappName
      })) || [],
    [socialFollowers]
  );

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
    <main className="flex-grow">
      <Tabs defaultValue="top" className="space-y-4">
        <TabList className="grid w-full grid-cols-2">
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
              buyPrice={user.buyPrice}
              numberOfHolders={user.numberOfHolders}
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
            <div
              key={`followers-${item.id}`}
              className="flex items-center justify-between w-full rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
              onClick={() => router.push(`/${item.id}`)}
            >
              <div className="space-x-4 flex items-center">
                <Avatar className="mt-px h-5 w-5">
                  <AvatarImage src={DEFAULT_PROFILE_PICTURE} />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{item.name}</p>
                  <Badge variant="outline">{item.dappName}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/${item.id}`)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </TabPanel>
      </Tabs>
    </main>
  );
}
