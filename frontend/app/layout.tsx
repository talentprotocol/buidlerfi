"use client";
import { Flex } from "@/components/shared/flex";
import { UserProvider } from "@/contexts/userContext";
import { LOGO } from "@/lib/assets";
import theme from "@/theme";
import { CssVarsProvider } from "@mui/joy";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseGoerli } from "viem/chains";
import { configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import "./globals.css";

// const projectId = "530148d9ddb07d128a40fc21cc9ffdd9";
const configureChainsConfig = configureChains([baseGoerli], [publicProvider()]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      cacheTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
      refetchOnMount: false
    }
  }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <Flex y component={"body"} sx={{ height: "100%" }}>
        <CssVarsProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            {mounted && <InnerProviders>{children}</InnerProviders>}
          </QueryClientProvider>
          <ToastContainer />
        </CssVarsProvider>
      </Flex>
    </html>
  );
}

//It is necessary to separate this to access the QueryClientProvider
const InnerProviders = ({ children }: { children: React.ReactNode }) => {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID not set in env vars");
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ["google", "email", "wallet", "github"],

        embeddedWallets: {
          createOnLogin: "users-without-wallets"
        },
        supportedChains: [baseGoerli],
        defaultChain: baseGoerli,
        appearance: {
          theme: "light",
          accentColor: "#18181b",
          logo: LOGO
        }
      }}
    >
      <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
        <UserProvider>{children}</UserProvider>
      </PrivyWagmiConnector>
    </PrivyProvider>
  );
};
