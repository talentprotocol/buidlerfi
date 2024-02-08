"use client";
import { EthIcon } from "@/components/icons/ethIcon";
import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useGetTopicInfo } from "@/hooks/useBuilderFiContract";
import { useTopic } from "@/hooks/useTopicsAPI";
import { formatEth } from "@/lib/utils";
import { Button, Skeleton, Typography } from "@mui/joy";
import { FC } from "react";

interface Props {
  setBuyModalState: (state: "closed" | "buy" | "sell") => void;
  topic: ReturnType<typeof useTopic>;
}

export const TopicOverview: FC<Props> = ({ setBuyModalState, topic }) => {
  const { user: currentUser } = useUserContext();

  const router = useBetterRouter();

  const { buyPrice, supply } = useGetTopicInfo(topic!.data!.id.toString());

  const userTopicHoldings =
    currentUser?.topicKeysOwned!.filter(t => t.topicId.toString() === topic.data?.id.toString())?.length || 0;

  const keysPlural = () => {
    if (userTopicHoldings != 1) {
      return "keys";
    } else {
      return "key";
    }
  };

  return (
    <>
      <Flex y gap2 p={2}>
        <Skeleton variant="circular" width={80} height={80}>
          <Flex x xsb mb={-1}>
            <Flex x ys gap1>
              {userTopicHoldings > 0 && (
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setBuyModalState("sell")}
                  disabled={(supply || 0) <= BigInt(1)}
                >
                  Sell
                </Button>
              )}

              <Button onClick={() => setBuyModalState("buy")} disabled={supply === BigInt(0)}>
                Buy
              </Button>
            </Flex>
          </Flex>
          <Flex x yc gap1>
            <Flex y fullwidth>
              <Typography level="h2">{topic.data!.name}</Typography>
              <Flex x yc gap={0.5} height="20px">
                <Typography level="title-sm" startDecorator={<EthIcon size="sm" />}>
                  {formatEth(buyPrice)}
                </Typography>
                {userTopicHoldings > 0 && (
                  <Typography level="body-sm">
                    • You own {userTopicHoldings.toString()} {keysPlural()}
                  </Typography>
                )}
              </Flex>
            </Flex>
          </Flex>

          <Flex x gap2 pointer onClick={() => router.push("./holders")}>
            <Typography level="body-sm">
              <strong>{topic.data?.topicOwners?.length}</strong> holders
            </Typography>
          </Flex>
        </Skeleton>
      </Flex>
    </>
  );
};
