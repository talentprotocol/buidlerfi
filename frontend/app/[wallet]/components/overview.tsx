"use client";
import { Flex } from "@/components/flex";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { useBuilderFIData } from "@/hooks/useBuilderFiApi";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { MUMBAI_ADDRESS } from "@/lib/address";
import { FARCASTER_LOGO, LENS_LOGO } from "@/lib/assets";
import { shortAddress } from "@/lib/utils";
import { Avatar, Button, Chip, Tooltip, Typography } from "@mui/joy";
import axios from "axios";
import Image from "next/image";
import { FC, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";

interface Props {
  socialData: SocialData;
  buyPrice?: bigint;
  totalSupply?: bigint;
  buyPriceAfterFee?: bigint;
  sellPrice?: bigint;
}

interface User {
  userSocialData: {
    talentProtocolData: {
      name: string;
      username: string;
      headline: string;
    };
  };
}

export const Overview: FC<Props> = ({ socialData, buyPrice, totalSupply, buyPriceAfterFee, sellPrice }) => {
  const { address } = useAccount();
  const [buyingKeys, setBuyingKeys] = useState(false);
  const [sellingKeys, setSellingKeys] = useState(false);
  const [user, setUser] = useState({} as User);
  const [openBuy, setOpenBuy] = useState(false);
  const { toast } = useToast();

  const { data: graphContext } = useBuilderFIData();

  const [holders, holdings] = useMemo(() => {
    const viewedUser = graphContext?.shareParticipants.find(user => user.owner == socialData.address.toLowerCase());
    return [viewedUser?.numberOfHolders || 0, viewedUser?.numberOfHoldings || 0];
  }, [graphContext?.shareParticipants, socialData.address]);

  const { data: supporterKeys } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "sharesBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const { data: supporterNumber } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "supporterNumber",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const { data: tx_buy, write: contractBuyKeys } = useContractWrite({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "buyShares",
    onSuccess: () => {
      setOpenBuy(false);
      setBuyingKeys(false);
      toast({
        title: "Transaction submitted!",
        description: `Hash: ${tx_buy}`
      });
    },
    onError: () => {
      setOpenBuy(false);
      setBuyingKeys(false);
      toast({
        title: "Unable to buy key",
        description: `There was an error processing your transaction`
      });
    }
  });

  const {} = useWaitForTransaction({
    hash: tx_buy?.hash,
    onSuccess: () => {
      toast({
        title: "Key bought!",
        description: `You bought a key of ${socialData.name}.`
      });
      window.location.reload();
    }
  });

  const { data: tx_sell, write: contractSellKeys } = useContractWrite({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "sellShares",
    onSuccess: () => {
      setOpenBuy(false);
      setSellingKeys(false);
      toast({
        title: "Transaction submitted!",
        description: `Hash: ${tx_sell?.hash}`
      });
    },
    onError: () => {
      setOpenBuy(false);
      setSellingKeys(false);
      toast({
        title: "Unable to sell key",
        description: `There was an error processing your transaction`
      });
    }
  });

  const {} = useWaitForTransaction({
    hash: tx_sell?.hash,
    onSuccess: () => {
      toast({
        title: "Key sold!",
        description: `You sold a key of ${socialData.name}.`
      });
      window.location.reload();
    }
  });

  const buyKeys = async () => {
    setBuyingKeys(true);
    contractBuyKeys({ args: [socialData.address], value: buyPriceAfterFee });
  };

  const sellKeys = async () => {
    setSellingKeys(true);

    contractSellKeys({ args: [socialData.address, BigInt(1)] });
  };

  const calculateBuyPrice = () => {
    return `${formatUnits(buyPrice || BigInt(0), 18)}`;
  };

  const calculateSellPrice = () => {
    return `${formatUnits(sellPrice || BigInt(0), 18)}`;
  };

  const holderNumberText = () => {
    console.log({ totalSupply, supporterNumber, supporterKeys });
    if (totalSupply === undefined || supporterNumber === undefined || supporterKeys === undefined) return "...";

    if (totalSupply === BigInt(0) && address == socialData.address) {
      return "Your first share is free.";
    }

    if (supporterNumber === BigInt(0) && supporterKeys > 0) {
      return "You are holder #0";
    }
    if (supporterNumber && supporterNumber > 0) {
      return `You are holder #${supporterNumber}`;
    } else {
      return "You don't hold any key";
    }
  };

  const hasKeys = () => {
    return !!supporterKeys && supporterKeys > 0;
  };

  const refreshTalentProtocolData = async () => {
    const response = await axios.put(`/api/users/${socialData.address}`, {
      talentProtocol: true
    });
    console.log(response.data.data);
    setUser(response.data.data);
  };

  return (
    <Flex y>
      <Flex x yc xsb>
        <Flex x yc gap2>
          <Avatar src={socialData.avatar} />
          <Flex y>
            <Typography level="h3" className="font-bold">
              {socialData.name}
            </Typography>
            {!socialData.name.startsWith("0x") && (
              <Typography className="text-xs text-muted-foreground">{shortAddress(socialData.address)}</Typography>
            )}
          </Flex>
        </Flex>
        <div className="space-x-2">
          <AlertDialog open={openBuy} onOpenChange={() => setOpenBuy(true)}>
            <AlertDialogTrigger>
              <Button disabled={totalSupply === BigInt(0) && address != socialData.address}>
                {hasKeys() ? "Trade" : "Buy"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-11/12">
              <AlertDialogHeader>
                <AlertDialogTitle>{hasKeys() ? "Trade" : "Buy"} Keys</AlertDialogTitle>
                <div className="flex flex-col pt-8">
                  <div className="flex items-center justify-between">
                    <p className="font-medium leading-none">{socialData.name}</p>
                    <p className="leading-none">{calculateBuyPrice() || "0"} MATIC</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      {hasKeys() ? `You own ${supporterKeys} keys` : "You don't own any keys"}
                    </p>
                    <p className="text-sm text-muted-foreground">Key price</p>
                  </div>
                  <Button onClick={() => buyKeys()} disabled={buyingKeys || sellingKeys} className="mt-4">
                    {buyingKeys && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Buy a key
                  </Button>
                  {hasKeys() && (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => sellKeys()}
                        disabled={buyingKeys || sellingKeys}
                        className="mt-2"
                      >
                        {sellingKeys && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Sell a key
                      </Button>
                      <div className="flex items-center justify-center mt-2">
                        <p className="text-sm text-muted-foreground">Sell price: {calculateSellPrice()}</p>
                      </div>
                    </>
                  )}
                  <Button
                    variant="plain"
                    onClick={() => setOpenBuy(false)}
                    disabled={buyingKeys || sellingKeys}
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Flex>
      <div className="flex items-center justify-between">
        <p className="text-base font-medium">{holderNumberText()}</p>
        <p className="text-base font-medium">{calculateBuyPrice()} MATIC</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">{holders} holders</p>
          <p className="text-sm text-muted-foreground">{holdings} holding</p>
        </div>
        <p className="text-sm text-muted-foreground">Key price</p>
      </div>
      {socialData.socialsList.length > 0 && (
        <div className="flex flex-wrap space-x-2">
          {socialData.socialsList.map(social => (
            <Tooltip key={social.dappName} title={social.dappName} placement="top">
              <Chip
                variant="outlined"
                color="neutral"
                size="lg"
                startDecorator={
                  social.dappName === "lens" ? (
                    <Image width={20} height={20} src={LENS_LOGO} alt="Lens logo" />
                  ) : (
                    <Image width={20} height={20} src={FARCASTER_LOGO} alt="Farcaster logo" />
                  )
                }
              >
                {social.profileName}
              </Chip>
            </Tooltip>
          ))}
        </div>
      )}

      <div className="flex flex-wrap space-x-2 my-5">
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex flex-column items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                username: {user.userSocialData.talentProtocolData.username}
              </p>
              <p className="text-sm text-muted-foreground">name: {user.userSocialData.talentProtocolData.name}</p>
              <p className="text-sm text-muted-foreground">
                headline: {user.userSocialData.talentProtocolData.headline}
              </p>
            </div>
          </div>
        )}
        <Button onClick={() => refreshTalentProtocolData()}>Get your info from Talent Protocol</Button>
      </div>
    </Flex>
  );
};
