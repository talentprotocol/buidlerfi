"use client";
import { AuthRoute } from "@/components/app/auth-route";
import { Flex } from "@/components/shared/flex";
import { DialogContainer } from "@/contexts/DialogContainer";
import { GlobalContextProvider } from "@/contexts/globalContext";
import { HistoryContextProvider } from "@/contexts/historyContext";
import { LayoutContextProvider, useLayoutContext } from "@/contexts/layoutContext";
import { UserProvider } from "@/contexts/userContext";
import theme from "@/theme";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles/CssVarsProvider";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { base, baseGoerli } from "viem/chains";
import { configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const supportedChain = process.env.NEXT_PUBLIC_CONTRACTS_ENV == "production" ? base : baseGoerli;
const configureChainsConfig = configureChains([supportedChain], [publicProvider()]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      cacheTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000
    }
  }
});

export default function InnerLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Flex
      y
      component={"body"}
      grow
      sx={{
        maxWidth: "min(100vw, 502px)",
        margin: "auto",
        minHeight: "100vh",
        border: theme => "1px solid " + theme.palette.neutral[300]
      }}
    >
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          {mounted && <InnerProviders>{children}</InnerProviders>}
        </QueryClientProvider>
        <ToastContainer />
        <DialogContainer />
      </CssVarsProvider>
    </Flex>
  );
}

//It is necessary to separate this to access the QueryClientProvider
const InnerProviders = ({ children }: { children: React.ReactNode }) => {
  const { rootContainerRef } = useLayoutContext();
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID not set in env vars");
  }

  return (
    <Flex y grow sx={{ position: "relative" }} ref={rootContainerRef}>
      <LayoutContextProvider>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
          config={{
            loginMethods: ["email", "google", "apple", "farcaster", "wallet"],
            supportedChains: [supportedChain],
            embeddedWallets: {
              createOnLogin: "all-users"
            },
            defaultChain: supportedChain,
            appearance: {
              theme: "light",
              accentColor: "#0B6EF9",
              showWalletLoginFirst: false
            },
            fiatOnRamp: {
              useSandbox: process.env.NEXT_PUBLIC_CONTRACTS_ENV !== "production"
            }
          }}
        >
          <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
            <HistoryContextProvider>
              <GlobalContextProvider>
                <UserProvider>
                  <AuthRoute>{children}</AuthRoute>
                </UserProvider>
              </GlobalContextProvider>
            </HistoryContextProvider>
          </PrivyWagmiConnector>
        </PrivyProvider>
      </LayoutContextProvider>
    </Flex>
  );
};
