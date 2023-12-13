import { UniswapRouterABI } from "@/lib/abi/UniswapRouter";
import { UNISWAP_ROUTER_ADDRESS } from "@/lib/constants";
import { toEthNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ReactNode, createContext, useContext } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "wagmi";

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

interface GlobalContextType {
  ethPrice: number;
}
const globalContext = createContext<GlobalContextType>({
  ethPrice: 0
});

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: ethPrice } = useQuery(["getEthPrice"], () => {
    return client.readContract({
      abi: UniswapRouterABI,
      address: UNISWAP_ROUTER_ADDRESS,
      functionName: "getAmountsOut",
      args: [
        BigInt("1000000000000000000"),
        ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xdAC17F958D2ee523a2206206994597C13D831ec7"]
      ]
    });
  });

  return (
    <globalContext.Provider value={{ ethPrice: ethPrice ? Math.floor(toEthNumber(ethPrice[1], 6)) : 0 }}>
      {children}
    </globalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(globalContext);
