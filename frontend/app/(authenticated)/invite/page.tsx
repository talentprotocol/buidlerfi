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

  return (
    <Flex y xc px={4}>
      <CardGiftcard sx={{ fontSize: "150px" }} />
      <Typography textAlign="center" textColor="neutral.400" level="body-lg">
        Points are airdropped every Friday and will have future uses in BuilderFi
      </Typography>

      <Flex y xs gap3 alignSelf="flex-start" mt={8}>
        <TitleAndValue
          title="Your unique invite code"
          value={
            <Flex y gap1>
              {user?.inviteCodes.map(code => (
                <Typography
                  sx={{ textDecoration: code.used >= code.maxUses ? "strikethrough" : undefined }}
                  key={code.code}
                >
                  {code.code}
                </Typography>
              ))}
            </Flex>
          }
        />
        <TitleAndValue title="Your points" value={points} />
        <TitleAndValue title="Invited people" value={invitedAmount} />
        <TitleAndValue title="Weekly leaderboard" value={`${leaderboardPosition}`} />
      </Flex>
    </Flex>
  );
}
