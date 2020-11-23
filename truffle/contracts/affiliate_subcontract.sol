// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.4;

import "./affiliate_contract.sol";

contract AffiliateSubcontract {
  // The main affiliate contract that created this contract, which in turn is owned by the business owner.
  address payable public immutable owner;
  // The affiliate's personal address.
  address payable public immutable affiliate;

  // The time this contract expires.
  uint256 public immutable expiration;
  // The time the seller's grace period ends. 
  uint256 public immutable sellerGracePeriodEnd;
  // The time the main contract expires.
  uint public immutable mainContractExpiration;

  // What index this subcontract has in the array in the main contract.
  uint public immutable indexNumber;
  // The address of the next subcontract when it gets created.
  // CHECK SECURITY FOR THIS
  address public nextSubcontract = address(0x0);

  // Flag for if the affiliate has called resolve or not. 
  bool public affiliateResolved = false;
  // Flag for if the seller allowed the grace period to expire on this subcontract.
  // NEED TO CHECK SECURITY FOR THIS!!
  bool public gracePeriodExpired = false;

  receive() external payable { }
  fallback() external payable { }

  constructor(
    address payable _affiliate,
    uint256 subcontractDuration,
    uint256 sellerGracePeriodDuration,
    uint256 _mainContractExpiration,
    uint _indexNumber
  ) payable {
    owner = msg.sender;
    affiliate = _affiliate;
    expiration = block.timestamp + subcontractDuration;
    sellerGracePeriodEnd = block.timestamp + subcontractDuration + sellerGracePeriodDuration;
    mainContractExpiration = _mainContractExpiration;
    indexNumber = _indexNumber;
  }

  modifier onlyMainContract {
    require(msg.sender == owner, "Only the main contract can call this method.");
    _;
  }

  modifier onlyAffiliate {
    require(msg.sender == affiliate, "Only the affiliate can call this method.");
    _;
  }

  function setNextSubcontract(address next) public onlyMainContract {
    require(sellerGracePeriodEnd > block.timestamp, "Seller grace period passed.");
    require(nextSubcontract == address(0x0), "Next subcontract already set.");
    nextSubcontract = next;
  }

  function affiliateResolve() public onlyAffiliate {
    require(expiration <= block.timestamp, "Subcontract not yet expired.");
    require(affiliateResolved == false, "Affiliate already called resolve successfully on this subcontract.");
    require(mainContractExpiration > block.timestamp, "Main contract expired.");
    uint totalSubcontracts = AffiliateContract(owner).totalSubcontracts();
    // If this is the final subcontract or if the seller has already made the next subcontract, we can cash out now.
    if ((indexNumber + 1) == totalSubcontracts || nextSubcontract != address(0x0)) {
      // PLACEHOLDER
      uint amount = 0;
      affiliate.transfer(amount);
      affiliateResolved = true;
    } else {
      // Else case - either the grace period isn't over and we're still waiting on the seller, or the seller has allowed it to pass without making the next subcontract.
      require(sellerGracePeriodEnd <= block.timestamp, "Seller grace period not yet over.");
      gracePeriodExpired = true;
      AffiliateContract(owner).affiliateResolve();
    }
  }

  // This method is used for cleaning up the other subcontracts when one goes "bad" ie when the seller doesn't
  // make a new subcontract within the grace period. 
  function affiliateCleanup(address payable bs) public onlyMainContract {
    require(mainContractExpiration > block.timestamp, "Main contract expired.");
    AffiliateSubcontract badSubcontract = AffiliateSubcontract(bs);
    require(badSubcontract.gracePeriodExpired(), "Provided subcontract address does not have gracePeriodExpired flag set to true.");
    selfdestruct(affiliate);
  }

  function sellerResolve(address payable seller) public onlyMainContract {
    require(mainContractExpiration <= block.timestamp, "Main contract not yet expired.");
    selfdestruct(seller);
  }
}