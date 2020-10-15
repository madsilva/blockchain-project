pragma solidity ^0.6.0;

contract SimpleStorage {
  string public storedData;

  event Set(address caller, string _value);

  constructor(string memory initialValue) public {
    storedData = initialValue;
  }

  function set(string memory x) public {
    storedData = x;
    emit Set(msg.sender, x);
  }

  function get() public view returns (string memory retVal) {
    return storedData;
  }
}
