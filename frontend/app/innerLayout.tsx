"use client";
import { AuthRoute } from "@/components/app/auth-route";
import { Flex } from "@/components/shared/flex";
import { DialogContainer } from "@/contexts/DialogContainer";
import { LayoutContextProvider, useLayoutContext } from "@/contexts/layoutContext";
import { UserProvider } from "@/contexts/userContext";
import theme from "@/theme";
import { CssVarsProvider } from "@mui/joy";
import {
  THEME_ID as MATERIAL_THEME_ID,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  experimental_extendTheme as materialExtendTheme
} from "@mui/material/styles";
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
  const materialTheme = materialExtendTheme();
  return (
    <Flex
      y
      component={"body"}
      grow
      m={0}
      sx={{
        maxWidth: "min(100vw, 500px)",
        margin: "auto",
        minHeight: "100vh",
        border: theme => "1px solid " + theme.palette.neutral[300]
      }}
    >
      <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
        <CssVarsProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <LayoutContextProvider>{mounted && <InnerProviders>{children}</InnerProviders>}</LayoutContextProvider>
          </QueryClientProvider>
          <ToastContainer />
          <DialogContainer />
        </CssVarsProvider>
      </MaterialCssVarsProvider>
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
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        config={{
          loginMethods: ["google", "email", "github", "apple", "twitter"],
          supportedChains: [supportedChain],
          embeddedWallets: {
            createOnLogin: "users-without-wallets"
          },
          defaultChain: supportedChain,
          appearance: {
            theme: "light",
            accentColor: "#0B6EF9"
          },
          fiatOnRamp: {
            useSandbox: process.env.NEXT_PUBLIC_CONTRACTS_ENV !== "production"
          }
        }}
      >
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <UserProvider>
            <AuthRoute>{children}</AuthRoute>
          </UserProvider>
        </PrivyWagmiConnector>
      </PrivyProvider>
    </Flex>
  );
};
