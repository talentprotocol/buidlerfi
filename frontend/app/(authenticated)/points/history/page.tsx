"use client";
import { Flex } from "@/components/shared/flex";
import { PageMessage } from "@/components/shared/page-message";
import { PointInfo } from "@/components/shared/point-info";
import { InjectTopBar } from "@/components/shared/top-bar";
import { useGetPointHistory } from "@/hooks/usePointApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { getDifference, sortIntoPeriods } from "@/lib/utils";
import { HelpOutline, History } from "@mui/icons-material";
import { Avatar, IconButton, Typography } from "@mui/joy";
import { useMemo, useState } from "react";

const periods = ["today", "last 7 days", "last 30 days", "last year", "all time"] as const;
export type period = (typeof periods)[number];

const PointHistoryEntry = ({ description, point, period }: { description: string; point: number; period: string }) => {
  return (
    <Flex x xs gap1>
      <Avatar src={LOGO_BLUE_BACK} />
      <Flex y>
        <Typography level="title-sm">{description}</Typography>
        <Flex x xs gap1>
          <Typography level="body-sm" sx={{ color: "#0B6EF9" }}>
            +{point} Points
          </Typography>
          <Typography level="body-sm">{period}</Typography>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default function PointHistory(): JSX.Element {
  const { data: points } = useGetPointHistory();
  const sorted = useMemo(() => sortIntoPeriods(points || []), [points]);
  const [showPointInfoModal, setShowPointInfoModal] = useState(false);
  const closePointInfo = () => {
    setShowPointInfoModal(false);
  };
  console.log(sorted);

  return (
    <Flex y grow component={"main"} px={2}>
      <InjectTopBar
        title="Point History"
        withBack
        endItem={
          <IconButton onClick={() => setShowPointInfoModal(true)}>
            <HelpOutline />
          </IconButton>
        }
      />
      <Flex y grow>
        {points?.length === 0 ? (
          <PageMessage icon={<History />} title="No point history" text="Your points history will be shown here" />
        ) : (
          Object.keys(sorted)
            .filter(key => sorted[key as keyof typeof sorted].length > 0)
            .map(key => {
              return (
                <Flex y gap2 key={key}>
                  <Typography sx={{ px: 2, pt: 2 }} level="title-sm">
                    {key}
                  </Typography>
                  {sorted[key as keyof typeof sorted]?.map(point => {
                    return (
                      <PointHistoryEntry
                        key={point.id}
                        description={point.description}
                        point={point.points}
                        period={getDifference(point.updatedAt)}
                      />
                    );
                  })}
                </Flex>
              );
            })
        )}
      </Flex>
      <PointInfo showPointInfoModal={showPointInfoModal} closePointInfo={closePointInfo} />
    </Flex>
  );
}
