"use client";

import { Flex } from "@/components/shared/flex";
import { useCreateUser } from "@/hooks/useUserApi";
import { Button, Input, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvitationCode() {
  const { replace } = useRouter();
  const { user: privyUser, logout } = usePrivy();
  const [inviteCode, setInviteCode] = useState<string>("");
  const createUser = useCreateUser();
  const handleOnClickProceed = async () => {
    if (!privyUser) {
      replace("/signup");
      return;
    }

    await createUser.mutateAsync({ privyUser, inviteCode });
    replace("/home");
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
            Got an invite code ?
          </Typography>
          <Typography level="body-sm" textColor="neutral.500">
            BuilderFi is currently in beta. Get an invite code from an existing user to sign up
          </Typography>
        </Flex>
        <Input
          fullWidth
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          placeholder="Enter invite code"
        />
      </Flex>

      <Flex y xc gap2 fullwidth>
        <Button loading={createUser.isLoading} fullWidth size="lg" onClick={handleOnClickProceed}>
          Proceed
        </Button>
        <Button disabled={createUser.isLoading} onClick={handleLogout} variant="plain">
          Log out
        </Button>
      </Flex>
    </Flex>
  );
}
