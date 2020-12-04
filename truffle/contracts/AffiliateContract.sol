// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.4;

import * as SC from "./AffiliateSubcontract.sol";

contract AffiliateContract {
  // The minimum number of subcontracts is 3.
  uint constant MIN_TOTAL_SUBCONTRACTS = 3;
  // The amount of time that's added on to the contract expiration time so that the affiliate has extra time to clear out all subcontracts.
  // PLACEHOLDER - NEED TO FIX
  uint256 constant CONTRACT_END_GRACE_PERIOD = 300;

  // The business that wants to pay affiliates. Set to the address that calls the contract's constructor.
  address payable public immutable owner;
  // The affiliate's personal address that funds will be sent to.
  address payable public immutable affiliate;

  // The total number of subcontracts that can be created from this one.
  uint public immutable totalSubcontracts;
  // The number of the latest created subcontract.
  uint public subcontractsSoFar = 0;
  // Array containing the subcontracts
  // Storage array (by default)
  address payable[] public subcontracts;

  // When the main contract will expire
  uint256 public immutable contractExpiration;
  // The length of time each subcontract will be valid for
  uint256 public immutable subcontractDuration;
  // The seller's grace period for issuing a new subcontract
  uint256 public immutable gracePeriodDuration;

  // The amount that will be staked for the affiliate to earn in each subcontract.
  uint public immutable subcontractStake;
  // The amount of the incentive fee staked by the seller to incentivize them to hold up their end of the deal.
  uint public immutable incentiveFee;
  // An integer representing the percentage of sales that the affiliate will receive. 
  uint public immutable affiliatePercentage;

  // The address of the oracle contract.
  address public oracle;

  // The constructor should be called with the amount of the incentive fee plus the first contract stake.
  constructor(
    address payable _affiliate,
    address _oracle,
    uint _totalSubcontracts,
    uint256 _subcontractDuration,
    uint256 _gracePeriodDuration,
    uint _subcontractStake,
    uint _incentiveFee,
    uint _affiliatePercentage
  ) payable {
    require(msg.value == (_incentiveFee + _subcontractStake), "amount sent to constructor must equal incentive fee plus one subcontract stake");
    require(_totalSubcontracts >= MIN_TOTAL_SUBCONTRACTS, "total subcontracts must be at least 3");
    owner = msg.sender;
    affiliate = _affiliate;
    oracle = _oracle;
    totalSubcontracts = _totalSubcontracts;
    // PLACEHOLDER - check this???
    contractExpiration = block.timestamp + (_totalSubcontracts*_subcontractDuration) + CONTRACT_END_GRACE_PERIOD;
    subcontractDuration = _subcontractDuration;
    gracePeriodDuration = _gracePeriodDuration;
    subcontractStake = _subcontractStake;
    incentiveFee = _incentiveFee;
    affiliatePercentage = _affiliatePercentage;

    // Creating the first subcontract.
    // REMEMBER THAT SUBCONTRACTSSOFAR MUST HAVE 1 SUBTRACTED BEFORE USING FOR INDEXING
    subcontracts.push(address((new SC.AffiliateSubcontract){value: _subcontractStake}(_affiliate, _subcontractDuration, _gracePeriodDuration, block.timestamp, 0)));
    subcontractsSoFar++;
  }

  receive() external payable { }
  fallback() external payable { }

  modifier onlyOwner {
    require(msg.sender == owner, "Only the owner can call this method.");
    _;
  }

  modifier contractNotExpired {
    require(contractExpiration > block.timestamp, "Main contract expired.");
    _;
  }

  function setOracleAddress (address _oracleAddress) public onlyOwner {
    oracle = _oracleAddress;
  }

  function getCurrentSubcontract() public view returns(address payable) {
    if (subcontractsSoFar > 0) {
      return subcontracts[subcontractsSoFar - 1];
    } else {
      return address(0x0);
    }
  }

  // called by the owner
  function createNextSubContract() public payable onlyOwner contractNotExpired {
    require(subcontractsSoFar < totalSubcontracts, "Total number of subcontracts exceeded.");
    require(msg.value == subcontractStake, "Incorrect stake amount.");
    // Getting a reference to the previous/"current" subcontract
    SC.AffiliateSubcontract lastSubcontract = SC.AffiliateSubcontract(subcontracts[subcontractsSoFar - 1]);
    // Checking all the conditions necessary for making the next subcontract.
    require(lastSubcontract.expiration() <= block.timestamp, "The last subcontract is not yet expired.");
    require(lastSubcontract.sellerGracePeriodEnd() > block.timestamp, "The seller grace period already ended.");
    // msg.value = total amount the subcontract will be populated with 
    subcontracts.push(address((new SC.AffiliateSubcontract){value: msg.value}(affiliate, subcontractDuration, gracePeriodDuration, lastSubcontract.expiration(), subcontractsSoFar)));
    lastSubcontract.setNextSubcontract(subcontracts[subcontractsSoFar]);
    subcontractsSoFar++;
  }

  // only called in dispute case
  function affiliateResolve() public contractNotExpired {
    bool calledBySubcontract = false;
    for (uint i = 0; i < subcontractsSoFar; i++) {
      if (subcontracts[i] == msg.sender) {
        calledBySubcontract = true;
      }
    }
    require(calledBySubcontract, "Only a subcontract can call this method.");
    SC.AffiliateSubcontract callerSubcontract = SC.AffiliateSubcontract(msg.sender);
    require(callerSubcontract.expiration() <= block.timestamp, "Caller subcontract not yet expired.");
    require(callerSubcontract.sellerGracePeriodEnd() <= block.timestamp, "Caller subcontract seller grace period not yet passed.");
    require((callerSubcontract.indexNumber() + 1) != totalSubcontracts, "Cannot be called by last subcontract.");
    require(callerSubcontract.nextSubcontract() == address(0x0), "Next subcontract is present.");
    for (uint i = 0; i < subcontractsSoFar; i++) {
      SC.AffiliateSubcontract(subcontracts[i]).affiliateCleanup(msg.sender);
    }
    selfdestruct(affiliate);
  }

  function sellerResolve() public onlyOwner {
    require(contractExpiration <= block.timestamp, "Main contract not yet expired.");
    for (uint i = 0; i < subcontractsSoFar; i++) {
      if (subcontracts[i] != address(0x0)) {
        SC.AffiliateSubcontract(subcontracts[i]).sellerResolve(owner);
      }
    }
    selfdestruct(owner);
  }
}