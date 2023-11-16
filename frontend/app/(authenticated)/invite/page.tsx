"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { ContentCopy } from "@mui/icons-material";
import { Card, IconButton, Typography } from "@mui/joy";
import { useMemo } from "react";
import { toast } from "react-toastify";

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
        Points are airdropped every Friday and will have future uses in builder.fi. Earn points by asking and answering
        questions, depositing funds, trading keys or inviting friends.
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
          <Typography>Builders invited</Typography>
        </Card>
      </Flex>
      <Flex y xs py={2}>
        <Typography level="body-sm">Your unique invite codes</Typography>
        <Flex y gap1>
          {user?.inviteCodes.length === 0 ? (
            <Typography level="h4">Coming soon</Typography>
          ) : (
            user?.inviteCodes.map(code => (
              <Flex x yc key={code.code} gap1>
                <Typography level="h4" sx={{ textDecoration: code.used >= code.maxUses ? "strikethrough" : undefined }}>
                  {code.code}
                </Typography>
                <IconButton
                  size="sm"
                  onClick={() => {
                    window.navigator.clipboard.writeText(code.code);
                    toast.success("Copied invite code to clipboard");
                  }}
                >
                  <ContentCopy sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              </Flex>
            ))
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
