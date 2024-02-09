// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.19;

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
  error OnlyOwnerCanCreateTopics();

  // Address where protocol fees are sent
  address public protocolFeeDestination;

  // Contract address to receive the topics pool prize
  // This address will redestribute the pool prize to the users contributing to the topics
  address public poolPrizeReceiver;

  // Fee percentages
  uint256 public protocolFeePercent;
  uint256 public builderFeePercent;

  // Flag to enable or disable trading
  bool public tradingEnabled;

  // Flag to enable or disable permissionless topic creation
  bool public openTopic;

  
  // Event emitted on trade execution
  event Trade(
    address trader,
    string topic,
    bytes32 topicHash,
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
    bytes32 topicHash
  );

  event Payout (
    address payee,
    uint256 amount
  );

  event PendingPayout (
    address payee,
    uint256 amount
  );

  // Mapping to track pending payouts
  mapping(address => uint256) public pendingPayouts;

  // Mapping to track balances of topics keys for each holder
  mapping(bytes32 => mapping(address => uint256)) public topicsKeysBalance;

  // Mapping to track total supply of keys per topics
  mapping(bytes32 => uint256) public topicsKeysSupply;

  // Constructor to set the initial admin role and initial topics
  constructor(address _owner, string[] memory topics, address _poolPrizeReceiver, address _protocolFeeDestination, uint256 _protocolFeePercent, uint256 _builderFeePercent) {
    _grantRole(DEFAULT_ADMIN_ROLE, _owner);
    createTopic(topics);
    poolPrizeReceiver = _poolPrizeReceiver;
    protocolFeeDestination = _protocolFeeDestination;
    protocolFeePercent = _protocolFeePercent;
    builderFeePercent = _builderFeePercent;
  }

  // Admin management functions
  function addAdmin(address _newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(DEFAULT_ADMIN_ROLE, _newAdmin);
  }

  function removeAdmin(address _newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _revokeRole(DEFAULT_ADMIN_ROLE, _newAdmin);
  }

  // Function to set the pool prize receiver
  function setPoolPrizeReceiver(address _poolPrizeReceiver) public onlyRole(DEFAULT_ADMIN_ROLE) {
    poolPrizeReceiver = _poolPrizeReceiver;
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

  // Functions to enable or disable open topic creation
  // This will be used in order to let the community create topics after the alpha stage
  function enableOpenTopic() public onlyRole(DEFAULT_ADMIN_ROLE) {
    openTopic = true;
  }
  function disableOpenTopic() public onlyRole(DEFAULT_ADMIN_ROLE) {
    openTopic = false;
  }

  // Function to calculate the price based on supply and amount
  function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
    uint256 sum1 = supply == 0 ? 0 : (supply - 1 )* (supply) * (2 * (supply - 1) + 1) / 6;
    uint256 sum2 = supply == 0 && amount == 1 
    ? 
    0 : 
    (supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1) / 6;
    uint256 summation = sum2 - sum1;
    return summation * 1 ether / 159000;
  }

  // Functions to get buying and selling prices, considering fees
  function getBuyPrice(string memory topic) public view returns (uint256) {
    bytes32 topicHash = keccak256(abi.encodePacked(topic));
    return getPrice(topicsKeysSupply[topicHash], 1);
  }

  function getSellPrice(string memory topic, uint256 amount) public view returns (uint256) {
    bytes32 topicHash = keccak256(abi.encodePacked(topic));
    return getPrice(topicsKeysSupply[topicHash] - amount, amount);
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

  function getTopicToBytes32(string memory topic) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(topic));
  }

  // Function to create topics. Only the admin can create topics

  function createTopic(string[] memory topicDescriptions) onlyRole(DEFAULT_ADMIN_ROLE) public {
    for (uint256 i = 0; i < topicDescriptions.length; i++) {
      _createTopic(topicDescriptions[i]);
    }
  }

  // Function to create topics. Everyone can create topics
  function createOpenTopic(string[] memory topicDescriptions) public {
    if(!openTopic) revert OnlyOwnerCanCreateTopics();

    for (uint256 i = 0; i < topicDescriptions.length; i++) {
      _createTopic(topicDescriptions[i]);
    }
  }

  function _createTopic(string memory topicDescription) internal {
    /// Convert string to hash (bytes32)
    bytes32 topicHash = keccak256(abi.encodePacked(topicDescription));
    /// Check if topicDescription is not empty
    require(topicHash.length > 0, "Topic description cannot be empty");
    /// Check if topicDescription is not already in use
    require(topicsKeysSupply[topicHash] == 0, "Topic already exists");
    /// Increment supply for that topic
    topicsKeysSupply[topicHash]++;
    /// Emit NewTopic
    emit NewTopic(
      msg.sender, 
      topicDescription, 
      topicHash
    );
  }

  /// Function to buy shares
  /// Includes checks for trading status, payment sufficiency, and first share purchase conditions
  /// @notice Can only buy one share at a time
  function buyShares(string memory topic, address _receiver) public payable nonReentrant {
    require(tradingEnabled == true, "Trading is not enabled");
    bytes32 topicHash = keccak256(abi.encodePacked(topic));

    uint256 supply = topicsKeysSupply[topicHash];
    if(supply == 0) revert OnlyOwnerCanCreateFirstShare();

    uint256 price = getPrice(supply, 1);
    uint256 nextPrice = getPrice(supply + 1, 1);

    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;

    if(msg.value < price + protocolFee + builderFee) revert InsufficientPayment();
    address receiver = _receiver == address(0) ? msg.sender : _receiver;
    
    topicsKeysBalance[topicHash][receiver]++;
    topicsKeysSupply[topicHash]++;
    emit Trade(
      receiver, 
      topic, 
      topicHash,
      true, 
      1, 
      price, 
      protocolFee, 
      builderFee, 
      supply + 1,
      nextPrice
    );

    payout(protocolFeeDestination, protocolFee);
    payout(poolPrizeReceiver, builderFee);
  }

  /// Function to sell shares
  /// Includes checks for trading status, payment sufficiency, and first share purchase conditions
  /// @notice Can only buy one share at a time
  function sellShares(string memory topic, address _receiver) public payable nonReentrant {
    require(tradingEnabled == true, "Trading is not enabled");
    bytes32 topicHash = keccak256(abi.encodePacked(topic));

    uint256 supply = topicsKeysSupply[topicHash];
    if(supply <= 1) revert CannotSellLastShare();
    if(topicsKeysBalance[topicHash][msg.sender] < 1) revert InsufficientShares();

    uint256 price = getPrice(supply - 1, 1);
    uint256 nextPrice = 0;

    if (price > 0) {
      nextPrice = getPrice(supply - 2, 1);
    }

    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;

    topicsKeysBalance[topicHash][msg.sender] -= 1;
    topicsKeysSupply[topicHash] = supply - 1;
    
    emit Trade(
      msg.sender,
      topic,
      topicHash,
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
    payout(poolPrizeReceiver, builderFee);
  }

  function payout(address payee, uint256 amount) internal {
    (bool success, ) = payee.call{value: amount}("");
    if (success) {
        emit Payout(payee, amount);
    } else if (!success) {
        uint256 currentPending = pendingPayouts[payee];
        uint256 newPending = currentPending + amount;
        require(newPending >= currentPending, "Overflow detected");
        pendingPayouts[payee] = newPending;
        emit PendingPayout(payee, newPending);
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