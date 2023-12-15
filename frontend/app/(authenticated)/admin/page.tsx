"use client";

import { refreshAllUsersProfileSA } from "@/backend/user/userServerActions";
import { Flex } from "@/components/shared/flex";
import { useProcessPendingTransactions } from "@/hooks/useTransaction";
import { Button } from "@mui/joy";
import { usePrivy } from "@privy-io/react-auth";

export default function AdminPage() {
  const { getAccessToken } = usePrivy();
  const processPastTransactions = useProcessPendingTransactions();

  return (
    <Flex y grow p={2}>
      <Button onClick={async () => refreshAllUsersProfileSA({ authorization: await getAccessToken() })}>
        Refresh social profile of all users
      </Button>
      <Button onClick={async () => await processPastTransactions.mutateAsync()}>Sync onchain TX</Button>
    </Flex>
  );
}
