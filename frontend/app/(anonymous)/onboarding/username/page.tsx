"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUpdateUser } from "@/hooks/useUserApi";
import { formatError } from "@/lib/utils";
import { Button, FormControl, FormHelperText, Input, Typography } from "@mui/joy";
import { useState } from "react";

export default function UsernamePage() {
  const router = useBetterRouter();
  const { refetch } = useUserContext();
  const [username, setUsername] = useState("");
  const updateUser = useUpdateUser();

  return (
    <Flex y gap3>
      <Flex y>
        <Typography textColor="neutral.800" level="h2" whiteSpace="pre-line">
          Select your username.
        </Typography>
        <Typography level="body-sm" mt={1}>
          We couldn&apos;t find any onchain data about you. Please select a username to continue.
        </Typography>
      </Flex>

      <FormControl error={!!updateUser.error} sx={{ width: "100%" }}>
        <Input type="text" placeholder="username" onChange={e => setUsername(e.target.value)} value={username} />
        {!!updateUser.error && <FormHelperText>{formatError(updateUser.error)}</FormHelperText>}
      </FormControl>
      <Button
        onClick={() =>
          updateUser
            .mutateAsync({ displayName: username, hasFinishedOnboarding: true })
            .then(() => refetch())
            .then(() => router.replace("/home"))
        }
      >
        Continue
      </Button>
    </Flex>
  );
}
