import { BigInt } from "@graphprotocol/graph-ts";
import { Trade as TradeEvent, BuidlerFiV1 } from "../generated/BuidlerFiV1/BuidlerFiV1";
import { Trade, ShareParticipant, ShareRelationship } from "../generated/schema";

const SHARES_CONTRACT = "0x7083d3c0B2c031dc62ecD14184eB61B6815b31ED";
const ONE_BI = BigInt.fromI32(1);
const ZERO_BI = BigInt.fromI32(0);

export function handleTrade(event: TradeEvent): void {
  // CREATE TRANSACTION INFO
  let entity = new Trade(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.trader = event.params.trader;
  entity.subject = event.params.subject;
  entity.isBuy = event.params.isBuy;
  entity.shareAmount = event.params.shareAmount;
  entity.ethAmount = event.params.ethAmount;
  entity.protocolEthAmount = event.params.protocolEthAmount;
  entity.subjectEthAmount = event.params.subjectEthAmount;
  entity.hodlerEthAmount = event.params.hodlerEthAmount;
  entity.supply = event.params.supply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let contract = BuidlerFiV1.bind(event.address);

  // CREATE BUYER INFO

  let buyer = ShareParticipant.load(event.params.trader.toHexString());
  // load buyer
  if (buyer === null) {
    buyer = new ShareParticipant(event.params.trader.toHexString());
    buyer.numberOfHoldings = ZERO_BI;
    buyer.numberOfHolders = ZERO_BI;
    buyer.supply = ZERO_BI;
    buyer.owner = event.params.trader.toHexString();
    buyer.tradingFeesAmount = event.params.hodlerEthAmount;
  } else {
    buyer.tradingFeesAmount = buyer.tradingFeesAmount.plus(event.params.hodlerEthAmount);
  }

  // CREATE SUBJECT INFO

  let subject = ShareParticipant.load(event.params.subject.toHexString());
  // load subject
  if (subject === null) {
    subject = new ShareParticipant(event.params.subject.toHexString());
    subject.supply = ONE_BI;
    subject.numberOfHolders = ZERO_BI;
    subject.numberOfHoldings = ZERO_BI;
    subject.owner = event.params.subject.toHexString();
  } else {
    if (event.params.isBuy) {
      subject.supply = subject.supply.plus(ONE_BI);
    } else {
      subject.supply = subject.supply.minus(ONE_BI);
    }
  }

  subject.buyPrice = contract.getBuyPrice(event.params.subject);
  subject.sellPrice = contract.getSellPrice(event.params.subject, ONE_BI);
  // edge case where we buy/sell from ourselves
  if (subject.id == buyer.id) {
    buyer.buyPrice = subject.buyPrice;
    buyer.sellPrice = subject.sellPrice;
    subject.tradingFeesAmount = buyer.tradingFeesAmount;
  }

  // CREATE RELATIONSHIP INFO
  let relationshipID = event.params.trader.toHexString() + "-" + event.params.subject.toHexString();
  let relationship = ShareRelationship.load(relationshipID);
  if (relationship === null) {
    relationship = new ShareRelationship(relationshipID);
    // the number of holders/holding only changes if the relationship did not exist before
    subject.numberOfHolders = subject.numberOfHolders.plus(ONE_BI);
    buyer.numberOfHoldings = buyer.numberOfHoldings.plus(ONE_BI);

    // edge case where we buy/sell from ourselves
    if (subject.id == buyer.id) {
      buyer.numberOfHolders = subject.numberOfHolders;
      subject.numberOfHoldings = buyer.numberOfHoldings;
    }
    relationship.holder = buyer.id;
    relationship.owner = subject.id;
    relationship.supporterNumber = subject.numberOfHolders;
    relationship.heldKeyNumber = ONE_BI;
  } else {
    if (event.params.isBuy) {
      if (relationship.heldKeyNumber == ZERO_BI) {
        subject.numberOfHolders = subject.numberOfHolders.plus(ONE_BI);
        buyer.numberOfHoldings = buyer.numberOfHoldings.plus(ONE_BI);
      }
      relationship.heldKeyNumber = relationship.heldKeyNumber.plus(ONE_BI);
    } else {
      relationship.heldKeyNumber = relationship.heldKeyNumber.minus(ONE_BI);
      if (relationship.heldKeyNumber == ZERO_BI) {
        subject.numberOfHolders = subject.numberOfHolders.minus(ONE_BI);
        buyer.numberOfHoldings = buyer.numberOfHoldings.minus(ONE_BI);
        relationship.supporterNumber = ZERO_BI;
      }
    }
  }

  buyer.save();
  subject.save();
  relationship.save();
}
