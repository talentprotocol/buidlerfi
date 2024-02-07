"use client";

import { Topbar } from "@/components/shared/top-bar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Flex } from "@/components/shared/flex";
import { useUserContext } from "@/contexts/userContext";
import { OnboardingHandler } from "@/components/app/onboarding-handler";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticatedAndActive } = useUserContext();
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
