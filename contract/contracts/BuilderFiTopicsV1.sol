// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.19;

//TODO: REMOVE tradingEnabled CHECK ON SELL FUNCTION
//TODO: MOVE FROM STRING TO BYTES FOR

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// BuilderFiAlphaV1 is a smart contract for managing trades of topics keys.
// It includes functionality for buying and selling shares, managing fees, and enabling/disabling trading.
contract BuilderFiTopicsV1 is AccessControl, ReentrancyGuard {
  // Custom errors for specific revert conditions
  error OnlyOwnerCanCreateFirstShare();
  error CannotSellLastShare();
  error InsufficientPayment();
  error InsufficientShares();

  // Address where protocol fees are sent
  address public protocolFeeDestination;

  // Fee percentages
  uint256 public protocolFeePercent;
  uint256 public builderFeePercent;

  // Flag to enable or disable trading
  bool public tradingEnabled;

  // Contract address to receive the pool prize
  address public poolPrize;

  // Event emitted on trade execution
  event Trade(
    address trader,
    string topic,
    bool isBuy,
    uint256 shareAmount,
    uint256 ethAmount,
    uint256 protocolEthAmount,
    uint256 builderEthAmount,
    uint256 supply,
    uint256 nextPrice
  );

  event NewTopic (
    address owner,
    string description,
    uint256 blockTimestamp
  );

  // Mapping to track pending payouts
  mapping(address => uint256) public pendingPayouts;

  // Mapping to track balances of topics keys for each holder
  mapping(string => mapping(address => uint256)) public topicsKeysBalance;

  // Mapping to track total supply of keys per topics
  mapping(string => uint256) public topicsKeysSupply;

  // Constructor to set the initial admin role and initial topics
  constructor(address _owner, string[] memory topics) {
    _grantRole(DEFAULT_ADMIN_ROLE, _owner);
    createTopic(topics);
  }

  // Admin management functions
  function addAdmin(address _newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(DEFAULT_ADMIN_ROLE, _newAdmin);
  }

  function removeAdmin(address _newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _revokeRole(DEFAULT_ADMIN_ROLE, _newAdmin);
  }

  // Fee management functions
  function setFeeDestination(address _feeDestination) public onlyRole(DEFAULT_ADMIN_ROLE) {
    protocolFeeDestination = _feeDestination;
  }

  function setProtocolFeePercent(uint256 _feePercent) public onlyRole(DEFAULT_ADMIN_ROLE) {
    protocolFeePercent = _feePercent;
  }

  function setBuilderFeePercent(uint256 _feePercent) public onlyRole(DEFAULT_ADMIN_ROLE) {
    builderFeePercent = _feePercent;
  }

  // Functions to enable or disable trading
  // This will be used in order to migrate the contract state to a new version after the alpha stage
  function enableTrading() public onlyRole(DEFAULT_ADMIN_ROLE) {
    tradingEnabled = true;
  }

  function disableTrading() public onlyRole(DEFAULT_ADMIN_ROLE) {
    tradingEnabled = false;
  }

  // Function to calculate the price based on supply and amount
  function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
    uint256 sum1 = supply == 0 ? 0 : (supply - 1 )* (supply) * (2 * (supply - 1) + 1) / 6;
    uint256 sum2 = supply == 0 && amount == 1 
    ? 
    0 : 
    (supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1) / 6;
    uint256 summation = sum2 - sum1;
    return summation * 1 ether / 16000;
  }

  // Functions to get buying and selling prices, considering fees
  function getBuyPrice(string memory topic) public view returns (uint256) {
    return getPrice(topicsKeysSupply[topic], 1);
  }

  function getSellPrice(string memory topic, uint256 amount) public view returns (uint256) {
    return getPrice(topicsKeysSupply[topic] - amount, amount);
  }

  function getBuyPriceAfterFee(string memory topic) public view returns (uint256) {
    uint256 price = getBuyPrice(topic);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;
    return price + protocolFee + builderFee;
  }

  function getSellPriceAfterFee(string memory topic, uint256 amount) public view returns (uint256) {
    uint256 price = getSellPrice(topic, amount);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;
    return price - protocolFee - builderFee;
  }

  function createTopic(string[] memory topicDescriptions) onlyRole(DEFAULT_ADMIN_ROLE) public {
    for (uint256 i = 0; i < topicDescriptions.length; i++) {
      createTopic(topicDescriptions[i]);
    }
  }

  function createTopic(string memory topicDescription) internal {
    /// Check if topicDescription is not empty
    require(bytes(topicDescription).length > 0, "Topic description cannot be empty");
    /// Check if topicDescription is not already in use
    require(topicsKeysSupply[topicDescription] == 0, "Topic already exists");
    /// Increment supply for that topic
    topicsKeysSupply[topicDescription]++;
    /// Emit NewTopic
    emit NewTopic(
      msg.sender, 
      topicDescription, 
      block.timestamp
    );
  }

  /// Function to buy shares
  /// Includes checks for trading status, payment sufficiency, and first share purchase conditions
  /// @notice Can only buy one share at a time
  function buyShares(string memory topic, address _receiver) public payable nonReentrant {
    require(tradingEnabled == true, "Trading is not enabled");

    uint256 supply = topicsKeysSupply[topic];
    if(supply == 0) revert OnlyOwnerCanCreateFirstShare();

    uint256 price = getPrice(supply, 1);
    uint256 nextPrice = getPrice(supply + 1, 1);

    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;

    if(msg.value < price + protocolFee + builderFee) revert InsufficientPayment();
    address receiver = _receiver == address(0) ? msg.sender : _receiver;
    
    topicsKeysBalance[topic][receiver]++;
    topicsKeysSupply[topic]++;
    emit Trade(
      receiver, 
      topic, 
      true, 
      1, 
      price, 
      protocolFee, 
      builderFee, 
      supply + 1,
      nextPrice
    );

    payout(protocolFeeDestination, protocolFee);
    payout(poolPrize, builderFee);
  }

  /// Function to sell shares
  /// Includes checks for trading status, payment sufficiency, and first share purchase conditions
  /// @notice Can only buy one share at a time
  function sellShares(string memory topic, address _receiver) public payable nonReentrant {
    //  TODO: this check should be removed to not create single point of centralization
    require(tradingEnabled == true, "Trading is not enabled");

    uint256 supply = topicsKeysSupply[topic];
    if(supply <= 1) revert CannotSellLastShare();
    if(topicsKeysBalance[topic][msg.sender] < 1) revert InsufficientShares();

    uint256 price = getPrice(supply - 1, 1);
    uint256 nextPrice = 0;

    if (price > 0) {
      nextPrice = getPrice(supply - 2, 1);
    }

    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;

    topicsKeysBalance[topic][msg.sender] -= 1;
    topicsKeysSupply[topic] = supply - 1;
    
    emit Trade(
      msg.sender,
      topic,
      false,
      1,
      price - protocolFee - builderFee,
      protocolFee,
      builderFee,
      supply - 1,
      nextPrice
    );
    // Send the payout to the external receiver if specified, otherwise send it to the sender
    address receiver = _receiver == address(0) ? msg.sender : _receiver;

    payout(receiver, price - protocolFee - builderFee);
    payout(protocolFeeDestination, protocolFee);
    payout(poolPrize, builderFee);
  }

  function payout(address payee, uint256 amount) internal {
    (bool success, ) = payee.call{value: amount}("");
    if (!success) {
        uint256 currentPending = pendingPayouts[payee];
        uint256 newPending = currentPending + amount;
        require(newPending >= currentPending, "Overflow detected");
        pendingPayouts[payee] = newPending;
    }
  }

  // This will be used in order to migrate the liquidity to a new smart contract
  // after the alpha stage
  function migrateLiquidity(address newContract) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(newContract != address(0), "Invalid address");
    uint256 contractBalance = address(this).balance;
    (bool success, ) = newContract.call{value: contractBalance}("");
    require(success, "Transfer failed");
  }

  // claim any payouts that weren't able to be claimed
  function claimPendingPayouts() public nonReentrant {
    uint256 pendingPayout = pendingPayouts[msg.sender];
    pendingPayouts[msg.sender] = 0;
    (bool success, ) = msg.sender.call{value: pendingPayout}("");
    require(success, "Could not payout pending payout");
  }
}