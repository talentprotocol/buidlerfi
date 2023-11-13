import { formatError } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { toHex } from "viem";
import * as all from "viem/chains";

// @ts-expect-error this is a "hack" to retrieve a chain from viem by chainId
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { defineChain: _, ...chains } = all;
function getChain(chainId: number) {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain as all.Chain;
    }
  }

  throw new Error(`Chain with id ${chainId} not found`);
}

export const useSwitchNetwork = () => {
  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(chainId) }]
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (
        switchError.code === 4902 ||
        //Sometimes, MM throws a generic error which wraps the original error.
        (switchError.code === -32603 && switchError.data?.originalError?.code === 4902)
      ) {
        const chain = getChain(chainId);
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: toHex(chain.id),
              blockExplorerUrls: [chain.blockExplorers?.default.url],
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.default.http]
            }
          ]
        });
      } else if (switchError.code === 4001) {
        throw new Error("Network change has been rejected by the user.");
      } else throw new Error("Could not switch the network: " + formatError(switchError));
    }
  }, []);

  return switchNetwork;
};

export const useGetActiveNetwork = () => {
  const [chainId, setChainId] = useState<string>();

  useEffect(() => {
    const getNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          setChainId(chainId);
        } catch (error) {
          console.error("Error fetching chain ID:", error);
        }
      }
    };

    getNetwork();

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
    };

    window.ethereum?.on("chainChanged", handleChainChanged);

    // Clean up the event listener when the component unmounts
    return () => {
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return chainId;
};
