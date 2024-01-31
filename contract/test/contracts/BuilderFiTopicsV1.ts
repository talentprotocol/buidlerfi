import chai from "chai";
import { ethers, waffle } from "hardhat";
import { solidity } from "ethereum-waffle";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import type { BuilderFiTopicsV1 } from "../../typechain-types";

chai.use(solidity);

const { expect } = chai;
const { parseUnits } = ethers.utils;
const { deployContract } = ethers;

//TODO: 
//"Check protocol fees increase when buying topics shares
//"Check protocol fees increase when selling topics shares

describe("BuilderFi-topics", () => {
  let creator: SignerWithAddress;
  let shareOwner: SignerWithAddress;
  let shareBuyer: SignerWithAddress;

  let builderFi: BuilderFiTopicsV1;

  beforeEach(async () => {
    [creator, shareOwner, shareBuyer] = await ethers.getSigners();
  });

  //const poolPrizeReceiver = "0xA2c5E17bC9B24D4FCb248d3274c53Ec7D99199c3";
  //const protocolFeeDestination = "0x33041027dd8F4dC82B6e825FB37ADf8f15d44053";

  const poolPrizeReceiver = "0x33041027dd8F4dC82B6e825FB37ADf8f15d44053";
  const protocolFeeDestination = "0xA2c5E17bC9B24D4FCb248d3274c53Ec7D99199c3";


  const protocolFeePercent = ethers.utils.parseUnits("0.04"); // 4%
  const builderFeePercent = ethers.utils.parseUnits("0.05"); // 5%

  const builder = async () => {
    return deployContract("BuilderFiTopicsV1", [creator.address, ["web3"], poolPrizeReceiver, protocolFeeDestination, protocolFeePercent, builderFeePercent]) as Promise<BuilderFiTopicsV1>;
  };

  describe("testing functions", () => {
    beforeEach(async () => {
      builderFi = await builder();

      await builderFi.setProtocolFeePercent(ethers.utils.parseUnits("0.05")); // 5%
      await builderFi.setBuilderFeePercent(ethers.utils.parseUnits("0.05")); // 5%

      await builderFi.connect(creator).enableTrading();
    });

    /// General tests
    it("does not allow anyone to buy a topic share before its creation", async () => {
      await expect(
        builderFi.connect(creator).buyShares("test#1", creator.address)
      ).to.be.reverted;
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

    it("can't buy or sell a non existing topic share", async () => {
      const enabling = await builderFi.connect(creator).enableTrading();

      // Ensure the topic exists
      await builderFi.connect(creator).createTopic(["test#6"]);

      const price = await builderFi.getBuyPriceAfterFee("test#6");
    
      // Attempt to buy shares in the topic
      await expect(
        builderFi.connect(shareBuyer).buyShares("test#7", shareBuyer.address, { value: price })
      ).to.be.reverted;

      // Attempt to sell shares in the topic
      await expect(
        builderFi.connect(shareBuyer).sellShares("test#7", shareBuyer.address, { value: price })
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

    /// Permissioned / Permissionless topic creation
    it("users other than admin cant create topics if not allowed", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
      expect(await builderFi.openTopic()).to.eq(false);
      await expect( builderFi.connect(shareBuyer).createOpenTopic(["test#7"])).to.be.reverted;
    });

    it("users other than admin can create topics if allowed", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
      expect(await builderFi.openTopic()).to.eq(false);
      await expect( builderFi.connect(shareBuyer).createOpenTopic(["test#7"])).to.be.reverted;
      console.log("openTopic", await builderFi.openTopic());
      await builderFi.connect(creator).enableOpenTopic();
      expect(await builderFi.openTopic()).to.eq(true);
      console.log("openTopic", await builderFi.openTopic());
      await expect( builderFi.connect(shareBuyer).createOpenTopic(["test#7"])).not.to.be.reverted;
      await expect( builderFi.connect(shareBuyer).createOpenTopic(["test#7"])).to.be.revertedWith("Topic already exists");
      await expect( builderFi.connect(creator).createOpenTopic(["test#7"])).to.be.revertedWith("Topic already exists");
      await expect( builderFi.connect(creator).createTopic(["test#7"])).to.be.revertedWith("Topic already exists");
      await builderFi.connect(creator).disableOpenTopic();
      expect(await builderFi.openTopic()).to.eq(false);
      await expect( builderFi.connect(shareBuyer).createOpenTopic(["test#9"])).to.be.reverted;
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
      ).to.be.reverted;

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

    // Bonding curve prices simulation
    it("Simulate buy price with the topics bonding curve for 400 keys", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
    
      let totalSpent = ethers.BigNumber.from("0");
      for (let i = 0; i < 400; i++) {
        const buyPrice = await builderFi.getBuyPriceAfterFee("test#6");
        //console.log(`Price for key ${i + 1}:`, ethers.utils.formatEther(buyPrice), "ETH");
    
        await builderFi.connect(shareOwner).buyShares("test#6", shareBuyer.address, { value: buyPrice });
        totalSpent = totalSpent.add(buyPrice);
      }
    
      console.log("Total spent for 400 keys:", ethers.utils.formatEther(totalSpent), "ETH");
    });


    /*

    it("Simulate sell price with the topics bonding curve for 400 keys", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
    
      let totalSpent = ethers.BigNumber.from("0");
      let totalReceived = ethers.BigNumber.from("0");
    
      // Buy 400 keys
      for (let i = 0; i < 400; i++) {
        const buyPrice = await builderFi.getBuyPriceAfterFee("test#6");
        const buyPriceWithoutFees = await builderFi.getBuyPrice("test#6");
        //console.log(`Price for key ${i + 1}:`, ethers.utils.formatEther(buyPrice), "ETH");
        console.log(ethers.utils.formatEther(buyPriceWithoutFees), "ETH");

        await builderFi.connect(shareOwner).buyShares("test#6", shareBuyer.address, { value: buyPrice });
        totalSpent = totalSpent.add(buyPrice);
      }
    
      console.log(ethers.utils.formatEther(totalSpent), "ETH");
    
      // Sell 400 keys
      for (let i = 0; i < 400; i++) {
        const sellPrice = await builderFi.getSellPriceAfterFee("test#6", 1);
        const sellPriceWithoutFees = await builderFi.getSellPrice("test#6", 1);
        //console.log(`Sell price for key ${400 - i}:`, ethers.utils.formatEther(sellPrice), "ETH");
        console.log(ethers.utils.formatEther(sellPriceWithoutFees), "ETH");
    
        await builderFi.connect(shareBuyer).sellShares("test#6", shareBuyer.address);
        totalReceived = totalReceived.add(sellPrice);
      }
      console.log("Total received for 400 keys:", ethers.utils.formatEther(totalReceived), "ETH");
    });

    */
    
    // Protocol fees tests
    it("Check protocol fees increase when buying topics shares", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
      // Log the hardcoded addresses
      const protocolFeeDestinationAddress = await builderFi.protocolFeeDestination();
      const poolPrizeReceiverAddress = await builderFi.poolPrizeReceiver();
      expect(protocolFeeDestinationAddress).to.eq(protocolFeeDestination);
      expect(poolPrizeReceiverAddress).to.eq(poolPrizeReceiver);
    
      let totalSpent = ethers.BigNumber.from("0");
      let payoutEventsToPooPrize = 0;
      let payoutEventsToProtocolFee = 0;
      let previousTotalSpent = ethers.BigNumber.from("0");
      let totalPayoutAmount = ethers.BigNumber.from("0");
      let lastPayoutAmount = ethers.BigNumber.from("0");
      for (let i = 0; i < 20; i++) {
        const buyPrice = await builderFi.getBuyPriceAfterFee("test#6");
    
        const tx = await builderFi.connect(shareOwner).buyShares("test#6", shareBuyer.address, { value: buyPrice });
        const receipt = await tx.wait();
        previousTotalSpent = totalSpent;
        totalSpent = totalSpent.add(buyPrice);
        // Process each Payout event
        receipt.events!.forEach(event => {
          if (event.event === "Payout") {
            const normalizedPayee = ethers.utils.getAddress(event.args!.payee);
            console.log("Payout event payee:", normalizedPayee);
            //console.log("Payout event payee:", event.args!.payee);
            const amount = ethers.BigNumber.from(event.args!.amount);
            if (event.args!.payee === poolPrizeReceiver) {
              payoutEventsToPooPrize++;
            } else if (event.args!.payee === protocolFeeDestination) {
              payoutEventsToProtocolFee++;
            }
          }
        }
      );
      // Assert that totalSpent is increased
      expect(totalSpent).to.be.gt(previousTotalSpent, `Total spent increased on iteration ${i}`);
      }
      expect(payoutEventsToPooPrize).to.eq(20);
      expect(payoutEventsToProtocolFee).to.eq(20);
      expect(payoutEventsToPooPrize + payoutEventsToProtocolFee).to.eq(40);
    });

    it("Check protocol fees increase when selling topics shares", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
    
      for (let i = 0; i < 20; i++) {
        const buyPrice = await builderFi.getBuyPriceAfterFee("test#6");
        await builderFi.connect(shareOwner).buyShares("test#6", shareOwner.address, { value: buyPrice });
      };

      let totalReceived = ethers.BigNumber.from("0");
      let payoutEventsToPoolPrize = 0;
      let payoutEventsToProtocolFee = 0;
      let payoutEventsToTopicOwner = 0;
      let previousTotalReceived = ethers.BigNumber.from("0");
      let totalPayoutAmount = ethers.BigNumber.from("0");
      let lastPayoutAmount = ethers.BigNumber.from("0");

      for (let i = 0; i < 19; i++) {
        const sellPrice = await builderFi.getSellPriceAfterFee("test#6", 1);
        const tx = await builderFi.connect(shareOwner).sellShares("test#6", shareOwner.address);
        const receipt = await tx.wait();
        previousTotalReceived = totalReceived;
        totalReceived = totalReceived.add(sellPrice);

        receipt.events!.forEach(event => {
          if (event.event === "Payout") {
            const normalizedPayee = ethers.utils.getAddress(event.args!.payee);
            console.log("Payout event payee:", normalizedPayee);
            const amount = ethers.BigNumber.from(event.args!.amount);
            if (event.args!.payee === poolPrizeReceiver) {
              payoutEventsToPoolPrize++;
            } else if (event.args!.payee === protocolFeeDestination) {
              payoutEventsToProtocolFee++;
            } else if (event.args!.payee === shareOwner.address) {
              payoutEventsToTopicOwner++;
            }
          }
        }
      );
      // Assert that totalReceived is increased
      expect(totalReceived).to.be.gt(previousTotalReceived, `Total received increased on iteration ${i}`);
      }
      expect(payoutEventsToPoolPrize).to.eq(19);
      expect(payoutEventsToProtocolFee).to.eq(19);
      expect(payoutEventsToTopicOwner).to.eq(19);
      expect(payoutEventsToPoolPrize + payoutEventsToProtocolFee + payoutEventsToTopicOwner).to.eq(57);
    });

    // Pool prizes tests
    it("should revert when a non-authorized user tries to change pool prize address", async () => {
      // Check initial state
      expect(await builderFi.poolPrizeReceiver()).to.eq(poolPrizeReceiver);
  
      // Change by an authorized user (creator)
      await builderFi.connect(creator).setPoolPrizeReceiver(shareBuyer.address);
      expect(await builderFi.poolPrizeReceiver()).to.eq(shareBuyer.address);
  
      // Attempt to change by an unauthorized user (shareBuyer) and expect a revert
      await expect(builderFi.connect(shareBuyer).setPoolPrizeReceiver(poolPrizeReceiver))
          .to.be.revertedWith("AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");
  });

    // Migrate Liquidity to new contract

    it("migrate liquidity to new contract address", async () => {
      await builderFi.connect(creator).createTopic(["test#6"]);
    
      let totalSpent = ethers.BigNumber.from("0");
    
      // Buy 20 keys
      for (let i = 0; i < 20; i++) {
        const buyPrice = await builderFi.getBuyPriceAfterFee("test#6");

        await builderFi.connect(shareOwner).buyShares("test#6", shareBuyer.address, { value: buyPrice });
        totalSpent = totalSpent.add(buyPrice);
      }

      const balance = await ethers.provider.getBalance(builderFi.address);
      console.log("Balance before migration:", ethers.utils.formatEther(balance), "ETH");
      const newContractBalanceBefore = await ethers.provider.getBalance(shareOwner.address);
      await builderFi.connect(creator).migrateLiquidity(shareOwner.address);
      const balanceAfter = await ethers.provider.getBalance(builderFi.address);
      const newContractBalanceAfter = await ethers.provider.getBalance(shareOwner.address);
      expect(balanceAfter).to.eq(0);
      console.log("Balance after migration:", ethers.utils.formatEther(balanceAfter), "ETH");
      expect(newContractBalanceAfter.gt(newContractBalanceBefore)).to.be.true;
    });
  });
});