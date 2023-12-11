import { useUserContext } from "@/contexts/userContext";
import { IN_USE_CHAIN_ID } from "@/lib/constants";
import { formatError } from "@/lib/utils";
import { ConnectedWallet, useConnectWallet } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useGenerateChallenge, useLinkWallet } from "./useUserApi";

export const useLinkExternalWallet = () => {
  const [walletToSign, setWalletToSign] = useState<ConnectedWallet>();
  const [challenge, setChallenge] = useState<ReturnType<typeof useGenerateChallenge>["data"]>();
  const [isLoading, setIsLoading] = useState(false);
  const [successCB, setSuccessCB] = useState<() => Promise<void>>();
  const { refetch } = useUserContext();

  const linkNewWallet = useLinkWallet();
  const generateChallenge = useGenerateChallenge();
  const { connectWallet } = useConnectWallet({
    onSuccess: async wallet => {
      //STEP2 new connected wallet is assigned to state, and challenge is generated -> will trigger STEP3
      try {
        if (!wallet) {
          setIsLoading(false);
          return;
        }

        if (wallet.chainId !== `eip155:${IN_USE_CHAIN_ID}`) {
          await wallet.switchChain(IN_USE_CHAIN_ID);
        }

        setWalletToSign(wallet as ConnectedWallet);
        const challenge = await generateChallenge.mutateAsync(wallet.address);
        if (!challenge) {
          setIsLoading(false);
          return;
        }
        setChallenge(challenge);
      } catch {
        setIsLoading(false);
      }
    },
    onError: () => setIsLoading(false)
  });

  const linkWallet = (onSuccess?: () => Promise<void>) => {
    setIsLoading(true);
    //STEP1: request wallet connect with privy
    if (onSuccess) setSuccessCB(() => onSuccess);
    connectWallet();
  };

  //STEP 3: when wallet is assigned to state 'walletToSign' and challenge is generated, this will execute and prompt to sign a message
  useQuery(
    ["requestLinkWallet", walletToSign?.address, challenge?.message],
    async () => {
      try {
        const signature = await walletToSign!.sign(challenge!.message);
        const user = await linkNewWallet.mutateAsync(signature);
        if (user?.socialWallet) toast.success("Wallet successfully linked");
        await refetch();
        if (successCB) await successCB();
        setIsLoading(false);
        return user;
      } catch (err) {
        toast.error("An error occured while linking wallet: " + formatError(err));
        setIsLoading(false);
        return err;
      }
    },
    {
      enabled: !!walletToSign && !!challenge
    }
  );

  return { linkWallet, isLoading };
};
