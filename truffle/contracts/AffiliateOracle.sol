// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.4;

import "./AffiliateSubcontract.sol";

contract AffiliateOracle {
  address public owner;
  uint private randNonce = 0;
  uint constant MODULUS = 1000;
  mapping(uint256 => bool) pendingRequests;

  event GetAffiliateTotalEvent(address callerAddress, uint id, address payable affiliate, uint256 startTime, uint256 endTime);
  event SetAffiliateTotalEvent(uint256 total, address callerAddress);

  constructor() {
    owner = msg.sender;
  }

  function getAffiliateTotal(address payable affiliate, uint256 startTime, uint256 endTime) public returns (uint256) {
    randNonce++;
    uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % MODULUS;
    pendingRequests[id] = true;
    emit GetAffiliateTotalEvent(msg.sender, id, affiliate, startTime, endTime);
    return id;
  }

  function setAffiliateTotal(uint256 _total, address payable _callerAddress, uint256 _id) public {
    require(msg.sender == owner, "Only the owner can call this method.");
    require(pendingRequests[_id], "This request is not in my pending list.");
    delete pendingRequests[_id];
    AffiliateSubcontract(_callerAddress).callback(_total, _id);
    emit SetAffiliateTotalEvent(_total, _callerAddress);
  }
}