"use client";

import { Flex } from "@/components/shared/flex";
import { Button, Input, Link, Typography } from "@mui/joy";
import { useState } from "react";

export default function InvitationCode() {
  const [inviteCode, setInviteCode] = useState<string>("");
  const handleOnClickProceed = () => {
    //Check invite code
    //Make appropriate API calls
    //Redirect to next step
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
        <Button fullWidth size="lg" onClick={() => handleOnClickProceed}>
          Proceed
        </Button>
        <Link href="/signup" textColor="neutral.500">
          Log out
        </Link>
      </Flex>
    </Flex>
  );
}
