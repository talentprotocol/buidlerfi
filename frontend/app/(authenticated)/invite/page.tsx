"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { Card, Typography } from "@mui/joy";
import { useMemo } from "react";

export default function Invite() {
  const { user } = useUserContext();

  const points = useMemo(() => user?.points?.reduce((prev, curr) => prev + curr.points, 0), [user?.points]);
  const invitedCount = user?.inviteCodes.reduce((prev, curr) => prev + curr.used, 0);

  return (
    <Flex y p={2}>
      <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
        Refer friends. <br /> Earn points.
      </Typography>
      <Typography level="body-sm" mt={1}>
        Points are airdropped every Friday and will have future uses in BuilderFi
      </Typography>
      <Flex x gap2 py={2}>
        <Card sx={{ flexGrow: 1, gap: 0 }} variant="soft">
          <Typography fontWeight={600} level="h4">
            {points}
          </Typography>
          <Typography>Your points</Typography>
        </Card>
        <Card sx={{ flexGrow: 1, gap: 0 }} variant="soft">
          <Typography fontWeight={600} level="h4">
            {invitedCount}
          </Typography>
          <Typography>Invited people</Typography>
        </Card>
      </Flex>
      <Flex y xs py={2}>
        <Typography level="body-sm">Your unique invite codes</Typography>
        <Flex y gap1>
          {user?.inviteCodes.map(code => (
            <Typography
              level="h4"
              sx={{ textDecoration: code.used >= code.maxUses ? "strikethrough" : undefined }}
              key={code.code}
            >
              {code.code}
            </Typography>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
