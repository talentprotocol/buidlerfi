"use client";
import { Flex } from "@/components/shared/flex";
import theme from "@/theme";
import { CssVarsProvider } from "@mui/joy";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import "./globals.css";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <Flex y component={"body"} sx={{ height: "100%" }}>
        <CssVarsProvider theme={theme}>
          <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
          </WagmiConfig>
          <ToastContainer />
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
