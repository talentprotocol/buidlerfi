"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useCreateUser } from "@/hooks/useUserApi";
import { LOGO_BLUE_BACK } from "@/lib/assets";
import { INTRO_BLOG_POST_LINK, WAITLIST_LINK } from "@/lib/constants";
import { formatError } from "@/lib/utils";
import { Button, FormControl, FormHelperText, Input, Typography } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvitationCode() {
  const { replace } = useRouter();
  const { user: privyUser, logout } = usePrivy();
  const { refetch } = useUserContext();
  const [inviteCode, setInviteCode] = useState<string>(window.localStorage.getItem("inviteCode") || "");
  const createUser = useCreateUser();
  const [overrideLoading, setOverrideLoading] = useState<boolean>(false);

  const handleOnClickProceed = async () => {
    if (!privyUser) {
      replace("/signup");
      return;
    }

    setOverrideLoading(true);
    await createUser.mutateAsync(inviteCode).catch(() => setOverrideLoading(false));
    await refetch();
    setOverrideLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    replace("/signup");
  };

  return (
    <Flex y ysb grow fullwidth p={2}>
      <Flex y gap={3}>
        <Flex x yc xc>
          <Typography mb={3} level="body-sm" fontWeight="600" startDecorator={<img src={LOGO_BLUE_BACK} />}>
            welcome to builder.fi
          </Typography>
        </Flex>
        <Flex y>
          <Typography level="h3">gm builder</Typography>
          <Typography level="body-md" textColor="neutral.600" className="remove-text-transform">
            On builder.fi you can monetize your knowledge by answering questions from other builders. Discover how to
            get early access in this{" "}
            <a href={INTRO_BLOG_POST_LINK} target="_blank">
              blog post
            </a>
            .
          </Typography>
        </Flex>
        <FormControl error={!!createUser.error} sx={{ width: "100%" }}>
          <Input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter invite code" />
          {!!createUser.error && <FormHelperText>{formatError(createUser.error)}</FormHelperText>}
        </FormControl>
      </Flex>
      <Flex y gap3>
        <Typography textTransform={"lowercase"} textColor={"neutral.600"} textAlign="center">
          Don&apos;t have an invite code?{" "}
          <a href={WAITLIST_LINK} target="_blank">
            Join waitlist
          </a>
        </Typography>
        <Button
          loading={createUser.isLoading || overrideLoading}
          disabled={inviteCode.length === 0}
          fullWidth
          size="lg"
          onClick={handleOnClickProceed}
        >
          Continue
        </Button>
        <Button disabled={createUser.isLoading} fullWidth onClick={handleLogout} variant="plain">
          Log out
        </Button>
      </Flex>
    </Flex>
  );
}
