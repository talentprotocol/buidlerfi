"use client";

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { baseGoerli } from "wagmi/chains";

import { BottomNav } from "@/components/shared/bottom-nav";
import { NavBalance } from "@/components/shared/nav-balance";
import { NavWeb3Button } from "@/components/shared/nav-web3-button";

import { Flex } from "@/components/shared/flex";
import { LOGO, LOGO_SMALL } from "@/lib/assets";
import theme from "@/theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { CssVarsProvider as JoyCssVarsProvider } from "@mui/joy/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

export const Dynamic = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <JoyCssVarsProvider theme={theme}>
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
                height={30}
                width={isSm ? 30 : 150}
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
      <ToastContainer />
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeVariables={{
          "--w3m-accent-color": "#000"
        }}
      />
    </JoyCssVarsProvider>
  );
};
