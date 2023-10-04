"use client";
import { useSocialData } from "@/hooks/useSocialData";
import { builderFIV1Abi } from "@/lib/abi/BuidlerFiV1";
import { MUMBAI_ADDRESS } from "@/lib/address";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { useContractRead } from "wagmi";
import { ChatTab } from "./components/chat-tab";
import { HoldersTab } from "./components/holders-tab";
import { HoldingTab } from "./components/holding-tab";
import { Overview } from "./components/overview";

export default function ProfilePage({ params }: { params: { wallet: `0x${string}` } }) {
  const { data: totalSupply } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "sharesSupply",
    args: [params.wallet]
  });

  const { data: buyPrice } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "getBuyPrice",
    args: [params.wallet]
  });

  const { data: buyPriceAfterFee } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "getBuyPriceAfterFee",
    args: [params.wallet]
  });

  const { data: sellPrice } = useContractRead({
    address: MUMBAI_ADDRESS,
    abi: builderFIV1Abi,
    functionName: "getSellPrice",
    args: [params.wallet, BigInt(1)]
  });

  const socialData = useSocialData(params.wallet);

  return (
    <main className="flex flex-col py-4 px-2 flex-grow">
      <Overview
        socialData={socialData}
        buyPrice={buyPrice}
        totalSupply={totalSupply}
        buyPriceAfterFee={buyPriceAfterFee}
        sellPrice={sellPrice}
      />
      <Tabs defaultValue="chat">
        <TabList className="grid w-full grid-cols-3 mb-8">
          <Tab disableIndicator value="chat">
            Chat
          </Tab>
          <Tab disableIndicator value="holding">
            Holding
          </Tab>
          <Tab disableIndicator value="holders">
            Holders
          </Tab>
        </TabList>
        <TabPanel value="chat" className="flex flex-col flex-grow space-y-4">
          <ChatTab socialData={socialData} />
        </TabPanel>
        <TabPanel value="holding" className="flex flex-col space-y-4">
          <HoldingTab wallet={params.wallet} />
        </TabPanel>
        <TabPanel value="holders" className="space-y-4">
          <HoldersTab wallet={params.wallet} />
        </TabPanel>
      </Tabs>
    </main>
  );
}
