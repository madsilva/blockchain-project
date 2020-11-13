pragma solidity ^0.6.0;

contract SimpleStorage {
  uint public totalEarned;
  

  event Set(address caller, uint _value);
  event Request(address caller, uint seller, uint code);
 
 
  constructor(uint initialValue) public {
    totalEarned = initialValue;
  }

  function set(uint x) public {
    totalEarned = x;
    emit Set(msg.sender, x);
  }

  function request(uint code, uint seller) public {
    emit Request(msg.sender, seller, code);
  }

  function get() public view returns (uint retVal) {
    return totalEarned;
  }
}
