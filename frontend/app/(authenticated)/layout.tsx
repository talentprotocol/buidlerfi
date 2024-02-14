"use client";

import { OnboardingHandler } from "@/components/app/onboarding-handler";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Flex } from "@/components/shared/flex";
import { LoadingPage } from "@/components/shared/loadingPage";
import { Topbar } from "@/components/shared/top-bar";
import { useUserContext } from "@/contexts/userContext";
import { useCreateUser } from "@/hooks/useUserApi";
import { useCallback, useEffect } from "react";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, privyUser, refetch, isAuthenticatedAndActive } = useUserContext();
  const createUser = useCreateUser();
  const handleCreateUser = useCallback(async () => {
    await createUser.mutateAsync();
    await refetch();
  }, [createUser, refetch]);

  useEffect(() => {
    //This may mean the user has not been created. Call create endpoint
    if (privyUser?.id && !isAuthenticatedAndActive && !createUser.isLoading) {
      handleCreateUser();
    }
  }, [createUser.isLoading, handleCreateUser, isAuthenticatedAndActive, privyUser, privyUser?.id, user]);

  if (privyUser?.id && !isAuthenticatedAndActive) {
    return <LoadingPage />;
  }

  return (
    <Flex y grow>
      <Topbar />
      <Flex y grow>
        <OnboardingHandler>{children}</OnboardingHandler>
      </Flex>
      {isAuthenticatedAndActive && <BottomNav />}
    </Flex>
  );
}
