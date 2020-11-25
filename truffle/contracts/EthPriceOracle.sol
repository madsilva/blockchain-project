// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.4;

import "./AffiliateSubcontract.sol";

contract EthPriceOracle {
  address public owner;
  uint private randNonce = 0;
  uint private modulus = 1000;
  mapping(uint256=>bool) pendingRequests;
  event GetLatestEthPriceEvent(address callerAddress, uint id, uint256 startTime, uint256 endTime);
  event SetLatestEthPriceEvent(uint256 ethPrice, address callerAddress);

  constructor() {
    owner = msg.sender;
  }

  function getLatestEthPrice(uint256 startTime, uint256 endTime) public returns (uint256) {
    randNonce++;
    uint id = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % modulus;
    pendingRequests[id] = true;
    emit GetLatestEthPriceEvent(msg.sender, id, startTime, endTime);
    return id;
  }

  function setLatestEthPrice(uint256 _ethPrice, address payable _callerAddress, uint256 _id) public {
    require(msg.sender == owner, "Only the owner can call this method.");
    require(pendingRequests[_id], "This request is not in my pending list.");
    delete pendingRequests[_id];
    AffiliateSubcontract(_callerAddress).callback(_ethPrice, _id);
    emit SetLatestEthPriceEvent(_ethPrice, _callerAddress);
  }
}