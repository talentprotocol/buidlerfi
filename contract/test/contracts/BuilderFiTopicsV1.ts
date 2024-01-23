import chai from "chai";
import { ethers, waffle } from "hardhat";
import { solidity } from "ethereum-waffle";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import type { BuilderFiTopicsV1 } from "../../typechain-types";

chai.use(solidity);

const { expect } = chai;
const { parseUnits } = ethers.utils;
const { deployContract } = ethers;

describe("BuilderFi-topics", () => {
  let creator: SignerWithAddress;
  let shareOwner: SignerWithAddress;
  let shareBuyer: SignerWithAddress;

  let builderFi: BuilderFiTopicsV1;

  beforeEach(async () => {
    [creator, shareOwner, shareBuyer] = await ethers.getSigners();
  });

  it("can be deployed", async () => {
    const action = deployContract("BuilderFiTopicsV1", [creator.address, ["web3"]]);

    await expect(action).not.to.be.reverted;
  });

  const builder = async () => {
    return deployContract("BuilderFiTopicsV1", [creator.address, ["web3"]]) as Promise<BuilderFiTopicsV1>;
  };

  describe("testing functions", () => {
    beforeEach(async () => {
      builderFi = await builder();

      await builderFi.setFeeDestination("0x33041027dd8F4dC82B6e825FB37ADf8f15d44053");
      await builderFi.setProtocolFeePercent(ethers.utils.parseUnits("0.05")); // 5%
      await builderFi.setBuilderFeePercent(ethers.utils.parseUnits("0.05")); // 5%

      await builderFi.connect(creator).enableTrading();
    });

    it("does not allow anyone to buy a topic share before its creation", async () => {
      await expect(
        builderFi.connect(creator).buyShares("test#1", creator.address)
      ).to.be.revertedWith("OnlyOwnerCanCreateFirstShare");
    });

    it("does not allow an address other than the owner to create a topic share", async () => {
      await expect(
        builderFi.connect(shareBuyer).createTopic(["test#2"])
      ).to.be.reverted;
    });

    it("allows the owner to create a topic share", async () => {
      await expect(builderFi.connect(creator).createTopic(["test#3"])).not.to.be.reverted;
    });

    it("does not allow the owner to create another time an existing key", async () => {
      // First, create the topic
      await builderFi.connect(creator).createTopic(["test#3"]);
    
      // Now, try to create the same topic again and expect it to revert
      await expect(
        builderFi.connect(creator).createTopic(["test#3"])
      ).to.be.revertedWith("Topic already exists");
    });

    it("allows the owner to create multiple topic shares at once", async () => {
      await expect(
        builderFi.connect(creator).createTopic(["test#4", "test#5", "test#6"])
      ).not.to.be.reverted;
    });

    it("can buy an existing topic share", async () => {
      const enabling = await builderFi.connect(creator).enableTrading();

      // Ensure the topic exists
      await builderFi.connect(creator).createTopic(["test#6"]);

      const price = await builderFi.getBuyPriceAfterFee("test#6");

      // Attempt to buy shares in the topic
      await expect(
        builderFi.connect(shareBuyer).buyShares("test#6", shareBuyer.address, { value: price })
      ).not.to.be.reverted;
    });

    it("can't buy an existing topic share if trading is not enabled", async () => {
      const enabling = await builderFi.connect(creator).disableTrading();

      // Ensure the topic exists
      await builderFi.connect(creator).createTopic(["test#6"]);

      const price = await builderFi.getBuyPriceAfterFee("test#6");

      // Attempt to buy shares in the topic
      await expect(
        builderFi.connect(shareBuyer).buyShares("test#6", shareBuyer.address, { value: price })
      ).to.be.reverted;
    });

    it("can't buy an existing topic share for less than the amount expected", async () => {
      const enabling = await builderFi.connect(creator).enableTrading();

      // Ensure the topic exists
      await builderFi.connect(creator).createTopic(["test#6"]);

      const price = await builderFi.getBuyPriceAfterFee("test#6");
    
      // Attempt to buy shares in the topic
      await expect(
        builderFi.connect(shareBuyer).buyShares("test#6", shareBuyer.address, { value: price.sub(1) })
      ).to.be.reverted;
    });

    it("can buy an existing topic share for more than the amount expected", async () => {
      const enabling = await builderFi.connect(creator).enableTrading();

      // Ensure the topic exists
      await builderFi.connect(creator).createTopic(["test#6"]);

      const price = await builderFi.getBuyPriceAfterFee("test#6");
      // Attempt to buy shares in the topic
      await expect(
        builderFi.connect(shareBuyer).buyShares("test#6", shareBuyer.address, { value: price.add(1) })
      ).not.to.be.reverted;
    });

    /// Supply tests

    it("changes the supply of topic keys after buys happens", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: initialPrice })
      const finalPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(creator).buyShares("test#6", creator.address, { value: finalPrice })
      const topic = await builderFi.getTopicToBytes32("test#6")
      expect(await builderFi.topicsKeysSupply(topic)).to.eq(3);
    });

    it("changes the supply of topic keys after sells happens", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", creator.address, { value: initialPrice })
      expect(await builderFi.topicsKeysSupply(topic)).to.eq(2);
      await builderFi.connect(creator).sellShares("test#6", creator.address)
      expect(await builderFi.topicsKeysSupply(topic)).to.eq(1);
    });

    /// Price tests
    it("changes the price of topic keys after buys happens", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", creator.address, { value: initialPrice })
      const finalPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(creator).buyShares("test#6", creator.address, { value: finalPrice })
     
      expect(finalPrice.gt(initialPrice)).to.be.true;
    });

    it("changes the price of topic keys after sells happens", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", creator.address, { value: initialPrice })
      await builderFi.connect(creator).sellShares("test#6", creator.address)
      const finalPrice = await builderFi.getBuyPriceAfterFee("test#6");

      expect(finalPrice.gt(initialPrice)).to.be.false;
    });

    /// Balance tests

    it("changes the balance of topic keys holder after buys happens", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      const initialBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: initialPrice })
      const meadBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      const meadPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: meadPrice })

      const finalBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      const finalPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: finalPrice })

      expect(initialBalance).to.eq(0);
      expect(meadBalance).to.eq(1);
      expect(finalBalance).to.eq(2);
    });

    it("changes the balance of topic keys holder after sells happens", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      const initialBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: initialPrice })
      const meadBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      await builderFi.connect(shareOwner).sellShares("test#6", shareOwner.address)

      const finalBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      const finalPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: finalPrice })

      expect(initialBalance).to.eq(0);
      expect(meadBalance).to.eq(1);
      expect(finalBalance).to.eq(0);
    });

    it("can't sell more topic keys more than owned", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);
      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      const initialBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)

      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: initialPrice })
      const meadPrice = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: meadPrice })
      const meadPrice2 = await builderFi.getBuyPriceAfterFee("test#6");
      await builderFi.connect(shareOwner).buyShares("test#6", creator.address, { value: meadPrice2 })

      const meadBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      await builderFi.connect(shareOwner).sellShares("test#6", shareOwner.address)
      await builderFi.connect(shareOwner).sellShares("test#6", shareOwner.address)
      // Fail to sell more than owned
      await expect(
        builderFi.connect(shareOwner).sellShares("test#6", shareOwner.address)
      ).to.be.revertedWith("InsufficientShares");

      const finalBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      
      expect(initialBalance).to.eq(0);
      expect(meadBalance).to.eq(2);
      expect(finalBalance).to.eq(0);
    });

    it("changes the price of topic keys after buys/sells happens for an external address receiver", async () => {
      const topic = await builderFi.getTopicToBytes32("test#6")
      await builderFi.connect(creator).createTopic(["test#6"]);

      const initialPrice = await builderFi.getBuyPriceAfterFee("test#6");
      const initialBalance = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      const initialBalanceOwnerETH = await ethers.provider.getBalance(shareOwner.address)
      const initialBalanceBuyerETH = await ethers.provider.getBalance(shareBuyer.address)

      await builderFi.connect(shareOwner).buyShares("test#6", shareBuyer.address, { value: initialPrice })

      const meadBalanceOwner = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      const meadBalanceOwnerETH = await ethers.provider.getBalance(shareOwner.address)
      const meadBalanceBuyer = await builderFi.topicsKeysBalance(topic, shareBuyer.address)
      const meadBalanceBuyerETH = await ethers.provider.getBalance(shareBuyer.address)

      const txResponse = await builderFi.connect(shareBuyer).sellShares("test#6", shareOwner.address)
      const sellTxReceipt = await txResponse.wait();
      const gasUsed = sellTxReceipt.gasUsed;
      const effectiveGasPrice = sellTxReceipt.effectiveGasPrice;
      const totalGasCost = gasUsed.mul(effectiveGasPrice);

      const finalBalanceOwner = await builderFi.topicsKeysBalance(topic, shareOwner.address)
      const finalBalanceOwnerETH = await ethers.provider.getBalance(shareOwner.address)
      const finalBalanceBuyer = await builderFi.topicsKeysBalance(topic, shareBuyer.address)
      const finalBalanceBuyerETH = await ethers.provider.getBalance(shareBuyer.address)
      const adjustedBalanceBuyerETH = finalBalanceBuyerETH.add(totalGasCost);
      const finalPrice = await builderFi.getBuyPriceAfterFee("test#6");

      expect(initialBalance).to.eq(0);
      expect(initialBalanceOwnerETH.gt(meadBalanceOwnerETH)).to.be.true; 
      expect(meadBalanceBuyerETH.eq(initialBalanceBuyerETH)).to.be.true; 
      expect(meadBalanceOwner).to.eq(0);
      expect(meadBalanceBuyer).to.eq(1);

      expect(finalBalanceOwnerETH.gt(meadBalanceOwnerETH)).to.be.true; 
      expect(adjustedBalanceBuyerETH.eq(meadBalanceBuyerETH)).to.be.true;

      expect(finalBalanceOwner).to.eq(0);
      expect(finalBalanceBuyer).to.eq(0);
    });

    // Protocol fees tests
    it("Check protocol fees increase", async () => {
    });

    // Pool prizes tests
    it("Check Pool prize fees increase", async () => {
    });
  });
});