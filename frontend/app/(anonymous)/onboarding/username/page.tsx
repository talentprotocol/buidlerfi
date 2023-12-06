"use client";

import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { useUpdateUser } from "@/hooks/useUserApi";
import { formatError } from "@/lib/utils";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";
import { Button, FormControl, FormHelperText, IconButton, Input, Typography } from "@mui/joy";
import { useState } from "react";

export default function UsernamePage() {
  const router = useBetterRouter();
  const { refetch } = useUserContext();
  const { user } = useUserContext();
  const [username, setUsername] = useState("");
  const updateUser = useUpdateUser();

  return (
    <Flex y ysb grow fullwidth>
      <Flex y gap={3}>
        <Flex x xsb yc>
          <Flex basis="100%">
            {!user?.socialWallet && router.searchParams.skiplink === "1" && (
              <IconButton sx={{ textAlign: "start" }}>
                <ArrowBackIosNewOutlined
                  onClick={() => router.push({ searchParams: { skiplink: undefined } }, { preserveSearchParams: true })}
                />
              </IconButton>
            )}
          </Flex>
          <Typography textAlign="center" level="body-sm" textColor="neutral.800" flexBasis={"100%"}>
            Welcome to builder.fi
          </Typography>
          <Flex basis="100%" />
        </Flex>
        <Flex y>
          <Typography my={1} level="h3">
            Select guest username
          </Typography>
          <Typography level="body-md" textColor="neutral.600">
            We couldn&apos;t find any onchain data about you. Please select a temporary username to continue.
          </Typography>
        </Flex>
        <FormControl error={!!updateUser.error} sx={{ width: "100%" }}>
          <Input
            type="text"
            placeholder="Enter username"
            onChange={e => setUsername(e.target.value)}
            value={username}
          />
          {!!updateUser.error && <FormHelperText>{formatError(updateUser.error)}</FormHelperText>}
        </FormControl>
      </Flex>
      <Flex y gap1>
        <Button
          size="lg"
          loading={updateUser.isLoading}
          fullWidth
          onClick={() => updateUser.mutateAsync({ displayName: username }).then(() => refetch())}
        >
          Continue
        </Button>
      </Flex>
    </Flex>
  );
}
