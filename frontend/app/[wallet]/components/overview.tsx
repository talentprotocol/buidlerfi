"use client";
import { BuyShareModal } from "@/app/[wallet]/components/buy-share-modal";
import { Flex } from "@/components/flex";
import { SocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { BASE_GOERLI_TESTNET } from "@/lib/address";
import { FARCASTER_LOGO, LENS_LOGO } from "@/lib/assets";
import { formatEth, shortAddress } from "@/lib/utils";
import { ContentCopy } from "@mui/icons-material";
import { Avatar, Button, Chip, IconButton, Tooltip, Typography } from "@mui/joy";
import Image from "next/image";
import { FC, useCallback, useMemo, useState } from "react";
import { useAccount, useContractRead } from "wagmi";

interface Props {
  socialData: SocialData;
}

export const Overview: FC<Props> = ({ socialData }) => {
  const { address } = useAccount();
  const [openBuy, setOpenBuy] = useState(false);

  const { data: totalSupply, refetch: refetchTotalSupply } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "sharesSupply",
    args: [socialData.address]
  });

  const { data: buyPrice, refetch: refetchBuyPrice } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "getBuyPrice",
    args: [socialData.address]
  });

  const { data: sellPrice, refetch: refetchSellprice } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "getSellPrice",
    args: [socialData.address, BigInt(1)]
  });

  const { data: supporterKeys, refetch: refetchKeys } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "sharesBalance",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const { data: supporterNumber, refetch: refetchSupporterNumber } = useContractRead({
    address: BASE_GOERLI_TESTNET,
    abi: builderFIV1Abi,
    functionName: "supporterNumber",
    args: [socialData.address, address!],
    enabled: !!address
  });

  const refetchAll = useCallback(async () => {
    refetchTotalSupply();
    refetchBuyPrice();
    refetchSellprice();
    refetchKeys();
    refetchSupporterNumber();
  }, [refetchBuyPrice, refetchKeys, refetchSellprice, refetchSupporterNumber, refetchTotalSupply]);

  const holderNumberText = () => {
    if (totalSupply === undefined || supporterNumber === undefined || supporterKeys === undefined) return "...";

    if (totalSupply === BigInt(0) && address == socialData.address) {
      return "Your first card is free.";
    }

    if (supporterNumber === BigInt(0) && supporterKeys > 0) {
      return "You are holder #0";
    }
    if (supporterNumber && supporterNumber > 0) {
      return `You are holder #${supporterNumber}`;
    } else {
      return "You don't own any cards";
    }
  };

  const hasKeys = useMemo(() => !!supporterKeys && supporterKeys > 0, [supporterKeys]);

  return (
    <Flex y gap1>
      <Flex x yc xsb>
        <Flex x yc gap2>
          <Avatar src={socialData.avatar} />
          <Flex y>
            <Typography level="h3" className="font-bold">
              {socialData.name}
            </Typography>
            {!socialData.name.startsWith("0x") && (
              <Flex x yc gap={0.5}>
                <Typography level="body-sm" textColor="neutral.400">
                  {shortAddress(socialData.address)}
                </Typography>
                <IconButton size="sm" onClick={() => window.navigator.clipboard.writeText(socialData.address)}>
                  <ContentCopy sx={{ fontSize: "0.9rem" }} />
                </IconButton>
              </Flex>
            )}
          </Flex>
        </Flex>
        <div className="space-x-2">
          <Button
            onClick={() => setOpenBuy(true)}
            disabled={totalSupply === BigInt(0) && address != socialData.address}
          >
            {hasKeys ? "Trade" : "Buy"}
          </Button>
        </div>
        <BuyShareModal
          open={openBuy}
          socialData={socialData}
          supporterKeysCount={supporterKeys}
          hasKeys={hasKeys}
          buyPrice={buyPrice}
          sellPrice={sellPrice}
          close={() => {
            refetchAll();
            setOpenBuy(false);
          }}
        />
      </Flex>
      <Flex x yc xsb>
        <Flex y>
          <Typography className="text-base font-medium">{holderNumberText()}</Typography>
          <Flex x yc gap2>
            {/* <Typography level="body-sm" textColor={'neutral.400'}>
							{holders} holders
						</Typography>
						<Typography level="body-sm" textColor={'neutral.400'}>
							{holdings} holding
						</Typography> */}
            <Typography level="body-sm" textColor="neutral.400">
              {hasKeys ? `You own ${supporterKeys} cards` : "You don't own any cards"}
            </Typography>
          </Flex>
        </Flex>

        <Flex y>
          <Typography className="text-base font-medium">{formatEth(buyPrice)} ETH</Typography>
          <Typography level="body-sm" textColor="neutral.400">
            Card price
          </Typography>
        </Flex>
      </Flex>

      {socialData.socialsList.length > 0 && (
        <Flex x gap2 wrap>
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
        </Flex>
      )}
    </Flex>
  );
};
