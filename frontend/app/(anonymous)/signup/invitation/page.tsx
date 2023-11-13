"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useCreateUser } from "@/hooks/useUserApi";
import { formatError } from "@/lib/utils";
import { Button, FormControl, FormHelperText, Input, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvitationCode() {
  const { replace } = useRouter();
  const { user: privyUser, logout } = usePrivy();
  const { refetch } = useUserContext();
  const [inviteCode, setInviteCode] = useState<string>("");
  const createUser = useCreateUser();

  const handleOnClickProceed = async () => {
    if (!privyUser) {
      replace("/signup");
      return;
    }

    await createUser.mutateAsync(inviteCode);
    await refetch();
  };

  const handleLogout = async () => {
    await logout();
    replace("/signup");
  };

  return (
    <Flex y ysb xs height="300px" fullwidth>
      <Flex y xs gap3 fullwidth>
        <Flex y gap1>
          <Typography textAlign="start" level="title-md">
            Got an invite code?
          </Typography>
          <Typography level="body-sm" textColor="neutral.500">
            builder.fi is currently invite-only. Explore how can you get an early access{" "}
            <a
              href="https://www.notion.so/talentprotocol/builder-fi-FAQ-dcebfe7103b34d11aba90de032173b39"
              target="_blank"
            >
              here
            </a>
            .
          </Typography>
        </Flex>
        <FormControl error={!!createUser.error} sx={{ width: "100%" }}>
          <Input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter invite code" />
          {!!createUser.error && <FormHelperText>{formatError(createUser.error)}</FormHelperText>}
        </FormControl>
      </Flex>

      <Flex y xc gap2 fullwidth>
        <Button loading={createUser.isLoading} fullWidth size="lg" onClick={handleOnClickProceed}>
          Proceed
        </Button>
        <Button disabled={createUser.isLoading} fullWidth onClick={handleLogout} variant="plain">
          Log out
        </Button>
      </Flex>
    </Flex>
  );
}
