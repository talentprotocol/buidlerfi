// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// BuilderFiAlphaV1 is a smart contract for managing trades of builder keys.
// It includes functionality for buying and selling shares, managing fees, and enabling/disabling trading.
contract BuilderFiAlphaV1 is AccessControl, ReentrancyGuard {
  // Custom errors for specific revert conditions
  error FundsTransferFailed();
  error OnlySharesBuilderCanBuyFirstShare();
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

  // Event emitted on trade execution
  event Trade(
    address trader,
    address builder,
    bool isBuy,
    uint256 shareAmount,
    uint256 ethAmount,
    uint256 protocolEthAmount,
    uint256 builderEthAmount,
    uint256 supply,
    uint256 nextPrice
  );

  // Mapping to track pending payouts
  mapping(address => uint256) public pendingPayouts;

  // Mapping to track balances of builder keys for each holder
  mapping(address => mapping(address => uint256)) public builderKeysBalance;

  // Mapping to track total supply of builder keys per builder
  mapping(address => uint256) public builderKeysSupply;

  // Mapping to track all holders
  mapping(address => address[]) public builderKeysHolders;

  // Constructor to set the initial admin role
  constructor(address _owner) {
    _grantRole(DEFAULT_ADMIN_ROLE, _owner);
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
  function getBuyPrice(address builder) public view returns (uint256) {
    return getPrice(builderKeysSupply[builder], 1);
  }

  function getSellPrice(address builder, uint256 amount) public view returns (uint256) {
    return getPrice(builderKeysSupply[builder] - amount, amount);
  }

  function getBuyPriceAfterFee(address builder) public view returns (uint256) {
    uint256 price = getBuyPrice(builder);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;
    return price + protocolFee + builderFee;
  }

  function getSellPriceAfterFee(address builder, uint256 amount) public view returns (uint256) {
    uint256 price = getSellPrice(builder, amount);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;
    return price - protocolFee - builderFee;
  }

  /// Function to buy shares
  /// Includes checks for trading status, payment sufficiency, and first share purchase conditions
  /// @notice Can only buy one share at a time
  function buyShares(address builder) public payable nonReentrant {
    require(tradingEnabled == true, "Trading is not enabled");

    uint256 supply = builderKeysSupply[builder];
    if(supply == 0 && builder != msg.sender) revert OnlySharesBuilderCanBuyFirstShare();

    uint256 price = getPrice(supply, 1);
    uint256 nextPrice = getPrice(supply + 1, 1);

    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;

    if(msg.value < price + protocolFee + builderFee) revert InsufficientPayment();
    
    builderKeysBalance[builder][msg.sender]++;
    builderKeysSupply[builder]++;
    emit Trade(
      msg.sender, 
      builder, 
      true, 
      1, 
      price, 
      protocolFee, 
      builderFee, 
      supply + 1,
      nextPrice
    );

    payout(protocolFeeDestination, protocolFee);
    payout(builder, builderFee);
  }

  /// Function to sell shares
  /// Includes checks for trading status, payment sufficiency, and first share purchase conditions
  /// @notice Can only buy one share at a time
  function sellShares(address builder) public payable nonReentrant {
    require(tradingEnabled == true, "Trading is not enabled");

    uint256 supply = builderKeysSupply[builder];
    if(supply <= 1) revert CannotSellLastShare();
    if(builderKeysBalance[builder][msg.sender] < 1) revert InsufficientShares();

    uint256 price = getPrice(supply - 1, 1);
    uint256 nextPrice = 0;

    if (price > 0) {
      nextPrice = getPrice(supply - 2, 1);
    }

    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 builderFee = price * builderFeePercent / 1 ether;

    builderKeysBalance[builder][msg.sender] -= 1;
    builderKeysSupply[builder] = supply - 1;
    
    emit Trade(
      msg.sender,
      builder,
      false,
      1,
      price,
      protocolFee,
      builderFee,
      supply - 1,
      nextPrice
    );

    payout(msg.sender, price - protocolFee - builderFee);
    payout(protocolFeeDestination, protocolFee);
    payout(builder, builderFee);
  }

  function payout(address payee, uint256 amount) internal {
    (bool success, ) = payee.call{value: amount}("");
    if (!success) {
      pendingPayouts[payee] += amount;
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
