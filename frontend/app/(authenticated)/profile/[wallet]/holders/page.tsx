"use client";

import { NotificationIcon } from "@/components/icons/notification";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { InjectTopBar } from "@/components/shared/top-bar";
import { UnifiedUserItem } from "@/components/shared/unified-user-item";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Chat, Lock } from "@mui/icons-material";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useParams } from "next/navigation";

export default function HoldersPage() {
  const { wallet } = useParams();
  const { holders, holdings, isOwnProfile, user } = useUserProfile(wallet as `0x${string}`);

  return (
    <Flex y component={"main"} grow>
      <InjectTopBar withBack title={user?.displayName || undefined} />
      <Tabs defaultValue={"holders"}>
        <TabList tabFlex={1} className="grid w-full grid-cols-3">
          <Tab value="holders">{holders?.length} Holders</Tab>
          <Tab value="holding">{holdings?.length} Holding</Tab>
        </TabList>
        <TabPanel value="holders">
          {holders?.length === 0 ? (
            <Flex y yc grow>
              {isOwnProfile ? (
                <PageMessage
                  icon={<Lock />}
                  title="You haven't launched you keys yet."
                  text="Buy your first key to allow others to buy your keys."
                />
              ) : (
                <PageMessage
                  icon={<NotificationIcon />}
                  title={user?.displayName + " hasn't launched their keys yet"}
                  text="get notified when they launch to become one of the first holders"
                />
              )}
            </Flex>
          ) : (
            holders?.map((holdingItem, i) => (
              <UnifiedUserItem
                user={holdingItem.holder}
                holderInfo={{
                  holderNumber: i + 1,
                  numberOfKeys: Number(holdingItem.amount)
                }}
                key={`home-${holdingItem.id}`}
              />
            ))
          )}
        </TabPanel>
        <TabPanel value="holding">
          {holdings?.length === 0 ? (
            <Flex y yc grow>
              {isOwnProfile ? (
                <PageMessage
                  icon={<Chat />}
                  title={"You haven't bought any keys yet."}
                  text={"Buy other people's keys to ask them a question and access all answers."}
                />
              ) : (
                <PageMessage
                  icon={<Lock />}
                  title={user?.displayName + " hasn't bought any keys yet."}
                  text={`${user?.displayName}'s keys will appear here when they buy some`}
                />
              )}
            </Flex>
          ) : (
            holdings?.map((holdingItem, i) => (
              <UnifiedUserItem
                user={holdingItem.owner}
                holderInfo={{
                  holderNumber: i + 1,
                  numberOfKeys: Number(holdingItem.amount)
                }}
                key={`home-${holdingItem.id}`}
              />
            ))
          )}
        </TabPanel>
      </Tabs>
    </Flex>
  );
}
