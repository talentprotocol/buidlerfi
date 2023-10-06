"use client";

import "./globals.css";

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { baseGoerli } from "wagmi/chains";

import { BottomNav } from "@/components/bottom-nav";
import { NavBalance } from "@/components/nav-balance";
import { NavWeb3Button } from "@/components/nav-web3-button";
import { Toaster } from "@/components/ui/toaster";

import { Flex } from "@/components/flex";
import { LOGO, LOGO_SMALL } from "@/lib/assets";
import muiTheme from "@/theme";
import { CssVarsProvider } from "@mui/joy";
import useMediaQuery from "@mui/material/useMediaQuery";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

const chains = [baseGoerli];
const projectId = "530148d9ddb07d128a40fc21cc9ffdd9";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isSm = useMediaQuery(muiTheme.breakpoints.down("sm"));
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <Flex y component={"body"} sx={{ height: "100%" }}>
        <CssVarsProvider theme={muiTheme} defaultMode="light">
          <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <Flex y py={7} grow>
                <Flex
                  x
                  xsb
                  yc
                  p={2}
                  sx={{ width: "calc(100% - 32px)", backgroundColor: "Background" }}
                  className="h-8 fixed top-0 left-0 z-10"
                >
                  <Image
                    className="cursor-pointer"
                    onClick={() => router.push("/")}
                    alt="App logo"
                    src={isSm ? LOGO_SMALL : LOGO}
                    height={40}
                    width={isSm ? 40 : 150}
                  />
                  <Flex x yc gap2>
                    <NavBalance />
                    <NavWeb3Button />
                  </Flex>
                </Flex>
                {children}
                <BottomNav />
              </Flex>
            </QueryClientProvider>
          </WagmiConfig>
          <Toaster />
          <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
            themeVariables={{
              "--w3m-accent-color": "#000"
            }}
          />
        </CssVarsProvider>
      </Flex>
    </html>
  );
}
