import { useUserContext } from "@/contexts/userContext";
import { formatError } from "@/lib/utils";
import { ConnectedWallet, useConnectWallet } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useGenerateChallenge, useLinkWallet } from "./useUserApi";

export const useLinkExternalWallet = () => {
  const [walletToSign, setWalletToSign] = useState<ConnectedWallet>();
  const [isLoading, setIsLoading] = useState(false);
  const [successCB, setSuccessCB] = useState<() => Promise<void>>();
  const { refetch } = useUserContext();

  const linkNewWallet = useLinkWallet();
  const generateChallenge = useGenerateChallenge();
  const { connectWallet } = useConnectWallet({
    onSuccess: async wallet => {
      setWalletToSign(wallet as ConnectedWallet);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });

  const linkWallet = (onSuccess?: () => Promise<void>) => {
    if (onSuccess) setSuccessCB(onSuccess);
    connectWallet();
  };

  useQuery(
    ["requestLinkWallet"],
    async () => {
      try {
        const challenge = await generateChallenge.mutateAsync(walletToSign!.address);
        if (!challenge) {
          setIsLoading(false);
          return;
        }
        const signature = await walletToSign!.sign(challenge.message);
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
      enabled: !!walletToSign
    }
  );

  return { linkWallet, isLoading };
};
