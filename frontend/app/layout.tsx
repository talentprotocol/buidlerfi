"use client";

import { Inter } from "next/font/google";
import "./globals.css";

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { lineaTestnet, mainnet, polygon, polygonMumbai } from "wagmi/chains";

import { BottomNav } from "@/components/bottom-nav";
import { NavBalance } from "@/components/nav-balance";
import { NavWeb3Button } from "@/components/nav-web3-button";
import { Toaster } from "@/components/ui/toaster";

import { Flex } from "@/components/flex";
import { appConfig } from "@/lib/appConfig";
import { LOGO, LOGO_SMALL } from "@/lib/assets";
import theme from "@/theme";
import { init } from "@airstack/airstack-react";
import { CssVarsProvider } from "@mui/joy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

const chains = [mainnet, polygonMumbai, lineaTestnet, polygon];
const projectId = "530148d9ddb07d128a40fc21cc9ffdd9";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

init(appConfig.publicAirstackToken);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={inter.className + " relative h-full"}>
        <CssVarsProvider theme={theme} defaultMode="light">
          <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <Flex y py={6}>
                <Flex fullwidth x xsb yc p={2} className="h-8 fixed top-0 left-0 border-b bg-white z-10">
                  <Image
                    className="hidden md:block cursor-pointer"
                    onClick={() => router.push("/")}
                    alt="App logo"
                    src={LOGO}
                    height={40}
                    width={150}
                  />
                  <Image
                    className="md:hidden cursor-pointer"
                    onClick={() => router.push("/")}
                    alt="App logo"
                    src={LOGO_SMALL}
                    height={40}
                    width={40}
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
      </body>
    </html>
  );
}
