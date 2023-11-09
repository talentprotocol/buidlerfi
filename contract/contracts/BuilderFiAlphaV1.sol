// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

// BuilderFiV1 is a smart contract for managing trades of builder keys.
// It includes functionality for buying and selling shares, managing fees, and enabling/disabling trading.
contract BuilderFiV1 is AccessControl {
  // Custom errors for specific revert conditions
  error FundsTransferFailed();
  error OnlySharesSubjectCanBuyFirstShare();
  error CannotSellLastShare();
  error InsufficientPayment();
  error InsufficientShares();

  // Address where protocol fees are sent
  address public protocolFeeDestination;

  // Fee percentages
  uint256 public protocolFeePercent;
  uint256 public subjectFeePercent;

  // Flag to enable or disable trading
  bool public tradingEnabled;

  // Event emitted on trade execution
  event Trade(
    address trader,
    address subject,
    bool isBuy,
    uint256 shareAmount,
    uint256 ethAmount,
    uint256 protocolEthAmount,
    uint256 subjectEthAmount,
    uint256 supply,
    uint256 nextPrice
  );

  // Mapping to track balances of builder keys for each holder
  mapping(address => mapping(address => uint256)) public builderKeysBalance;

  // Mapping to track total supply of builder keys per builder
  mapping(address => uint256) public builderKeysSupply;

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

  function setSubjectFeePercent(uint256 _feePercent) public onlyRole(DEFAULT_ADMIN_ROLE) {
    subjectFeePercent = _feePercent;
  }

  // Functions to enable or disable trading
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
  function getBuyPrice(address sharesSubject) public view returns (uint256) {
    return getPrice(builderKeysSupply[sharesSubject], 1);
  }

  function getSellPrice(address sharesSubject, uint256 amount) public view returns (uint256) {
    return getPrice(builderKeysSupply[sharesSubject] - amount, amount);
  }

  function getBuyPriceAfterFee(address sharesSubject) public view returns (uint256) {
    uint256 price = getBuyPrice(sharesSubject);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 subjectFee = price * subjectFeePercent / 1 ether;
    return price + protocolFee + subjectFee;
  }

  function getSellPriceAfterFee(address sharesSubject, uint256 amount) public view returns (uint256) {
    uint256 price = getSellPrice(sharesSubject, amount);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 subjectFee = price * subjectFeePercent / 1 ether;
    return price - protocolFee - subjectFee;
  }

  /// @notice Can only buy one share at a time
  function buyShares(address sharesSubject) public payable {
    require(tradingEnabled == true, "Trading is not enabled");

    uint256 supply = builderKeysSupply[sharesSubject];
    if(supply == 0 && sharesSubject != msg.sender) revert OnlySharesSubjectCanBuyFirstShare();

    uint256 price = getPrice(supply, 1);
    uint256 nextPrice = getPrice(supply + 1, 1);
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 subjectFee = price * subjectFeePercent / 1 ether;
    if(msg.value < price + protocolFee + subjectFee) revert InsufficientPayment();
    
    builderKeysBalance[sharesSubject][msg.sender]++;
    builderKeysSupply[sharesSubject]++;
    emit Trade(
      msg.sender, 
      sharesSubject, 
      true, 
      1, 
      price, 
      protocolFee, 
      subjectFee, 
      supply + 1,
      nextPrice
    );

    (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
    (bool success2, ) = sharesSubject.call{value: subjectFee}("");

    if(!(success1 && success2)) revert FundsTransferFailed();
  }

  function sellShares(address sharesSubject, uint256 amount) public payable {
    require(tradingEnabled == true, "Trading is not enabled");

    uint256 supply = builderKeysSupply[sharesSubject];
    if(supply <= amount) revert CannotSellLastShare();
    if(builderKeysBalance[sharesSubject][msg.sender] < amount) revert InsufficientShares();

    uint256 price = getPrice(supply - amount, amount);
    uint256 nextPrice = 0;

    if (price > 0) {
      nextPrice = getPrice(supply - amount - 1, 1);
    }
    uint256 protocolFee = price * protocolFeePercent / 1 ether;
    uint256 subjectFee = price * subjectFeePercent / 1 ether;

    builderKeysBalance[sharesSubject][msg.sender] -= amount;
    builderKeysSupply[sharesSubject] = supply - amount;
    emit Trade(
      msg.sender,
      sharesSubject,
      false,
      amount,
      price,
      protocolFee,
      subjectFee,
      supply - amount,
      nextPrice
    );
    (bool success1, ) = msg.sender.call{value: price - protocolFee - subjectFee}("");
    (bool success2, ) = protocolFeeDestination.call{value: protocolFee}("");
    (bool success3, ) = sharesSubject.call{value: subjectFee}("");

    if(!(success1 && success2 && success3)) revert FundsTransferFailed();
  }

  function migrateLiquidity(address newContract) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(newContract != address(0), "Invalid address");
    uint256 contractBalance = address(this).balance;
    (bool success, ) = newContract.call{value: contractBalance}("");
    require(success, "Transfer failed");
  }
}
