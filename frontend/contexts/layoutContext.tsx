import { InstallAppModal } from "@/components/app/onboarding/install-app-modal";
import { useBetterRouter } from "@/hooks/useBetterRouter";
import { ReactNode, RefObject, createContext, useContext, useMemo, useRef } from "react";

interface Navigator extends globalThis.Navigator {
  standalone?: boolean;
}

interface LayoutContextType {
  rootContainerRef: RefObject<HTMLDivElement>;
  topBarRef?: RefObject<HTMLDivElement>;
  isPwaInstalled: boolean;
}
const layoutContext = createContext<LayoutContextType>({
  rootContainerRef: { current: null },
  topBarRef: { current: null },
  isPwaInstalled: false
});

export const LayoutContextProvider = ({ children }: { children: ReactNode }) => {
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  const isPwaInstalled = useMemo(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const { standalone } = navigator as Navigator;
    return document.referrer.startsWith("android-app://") || standalone || isStandalone;
  }, []);

  const router = useBetterRouter();
  const isInstallModalOpen = router.searchParams.installmodal === "true";

  return (
    <layoutContext.Provider value={{ rootContainerRef, topBarRef, isPwaInstalled }}>
      {isInstallModalOpen && (
        <InstallAppModal close={() => router.replace({ searchParams: { installmodal: undefined } })} />
      )}
      {children}
    </layoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(layoutContext);
