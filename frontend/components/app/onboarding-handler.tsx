"use client";

import { useUserContext } from "@/contexts/userContext";
import { useSetUserSetting } from "@/hooks/useUserApi";
import { UserSettingKeyEnum } from "@prisma/client";
import { usePrivy } from "@privy-io/react-auth";
import { ReactNode, useMemo, useState } from "react";
import { ExportWalletModal } from "./onboarding/export-wallet-modal";
import { LinkWalletModal } from "./onboarding/link-wallet-modal";
import { TagsModal } from "./onboarding/tags-modal";

export const OnboardingHandler = ({ children }: { children: ReactNode }) => {
  const { user, userSettings, refetch } = useUserContext();
  const [skipConnectWallet, setSkipConnectWallet] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exportWallet } = usePrivy();
  const setUserSetting = useSetUserSetting();

  const mustConnectWallet = useMemo(() => !user?.socialWallet && !skipConnectWallet, [user, skipConnectWallet]);
  const mustSelectTags = useMemo(() => user?.tags.length === 0, [user]);

  const onSkipExportWallet = async () => {
    await setUserSetting.mutateAsync({ key: UserSettingKeyEnum.ONBOARDING_HAS_EXPORTED_WALLET, value: "true" });
    await refetch();
  };

  const onExportWallet = async () => {
    await setUserSetting.mutateAsync({ key: UserSettingKeyEnum.ONBOARDING_HAS_EXPORTED_WALLET, value: "true" });
    setIsExporting(true);
    await exportWallet();
    setIsExporting(false);
    await refetch();
  };

  const renderModal = () => {
    if (userSettings?.ONBOARDING_HAS_EXPORTED_WALLET !== "true") {
      return <ExportWalletModal onClose={onSkipExportWallet} onExport={onExportWallet} />;
    }
    if (mustConnectWallet) {
      return <LinkWalletModal onSkip={() => setSkipConnectWallet(true)} />;
    }
    if (mustSelectTags) {
      return <TagsModal />;
    }
  };

  return (
    <>
      {!isExporting && user && !user?.hasFinishedOnboarding && renderModal()}
      {children}
    </>
  );
};
