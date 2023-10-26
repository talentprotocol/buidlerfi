"use client";

import { TitleAndValue } from "@/components/app/invite/titleAndValue";
import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { CardGiftcard } from "@mui/icons-material";
import { Typography } from "@mui/joy";
import { useMemo } from "react";

export default function Invite() {
  const { user } = useUserContext();
  const points = useMemo(() => user?.points?.reduce((prev, curr) => prev + curr.points, 0), [user?.points]);

  const leaderboardPosition = "Coming soon";
  const invitedAmount = user?.inviteCodes.reduce((prev, curr) => prev + curr.used, 0);
  const inviteCode = user?.inviteCodes.find(inviteCode => inviteCode.used < inviteCode.maxUses)?.code;

  return (
    <Flex y xc px={4}>
      <CardGiftcard sx={{ fontSize: "150px" }} />
      <Typography textAlign="center" textColor="neutral.400" level="body-lg">
        Points are airdropped every Friday and will have future uses in BuilderFi
      </Typography>

      <Flex y xs gap3 alignSelf="flex-start" mt={8}>
        <TitleAndValue title="Your unique invite code" value={inviteCode} />
        <TitleAndValue title="Your points" value={points} />
        <TitleAndValue title="Invited people" value={invitedAmount} />
        <TitleAndValue title="Weekly leaderboard" value={`${leaderboardPosition}`} />
      </Flex>
    </Flex>
  );
}
