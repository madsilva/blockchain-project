// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.4;

import "./AffiliateContract.sol";
import "./AffiliateOracle.sol";

contract AffiliateSubcontract {
  // The main AffiliateContract that created this contract, which in turn is owned by the business owner.
  address payable public immutable owner;
  // The affiliate's personal address.
  address payable public immutable affiliate;

  // The time this contract expires.
  uint256 public immutable expiration;
  // The time the seller's grace period ends. 
  uint256 public immutable sellerGracePeriodEnd;

  // What index this subcontract has in the array in the main contract.
  uint public immutable indexNumber;
  // The address of the next subcontract when it gets created.
  address public nextSubcontract = address(0x0);

  // Flag that is true when the affiliate has successfully called the resolve method and cashed out.
  bool private affiliateResolved = false;
  // Flag that is true if the seller allowed the grace period to expire on this subcontract.
  bool public gracePeriodExpired = false;

  // The most recent value for the total sales for this affiliate for the time this subcontract covers.
  uint256 public currentTotal;
  // The timestamp when currentTotal was last updated.
  uint256 private totalLastUpdated;
  // The timestamp where this subcontract starts counting sales (i.e., where the last subcontract left off).
  uint256 public immutable startTime;

  // Used to keep track of async requests to get information from the oracle.
  mapping(uint256 => bool) myRequests;

  event CurrentTotalUpdatedEvent(uint256 currentTotal, uint256 id);

  receive() external payable { }
  fallback() external payable { }

  constructor(
    address payable _affiliate,
    uint256 subcontractDuration,
    uint256 sellerGracePeriodDuration,
    uint256 _startTime,
    uint _indexNumber
  ) payable {
    owner = msg.sender;
    affiliate = _affiliate;
    expiration = block.timestamp + subcontractDuration;
    sellerGracePeriodEnd = block.timestamp + subcontractDuration + sellerGracePeriodDuration;
    startTime = _startTime;
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

  function updateCurrentTotal() public onlyAffiliate {
    require(affiliateResolved == false, "Affiliate already called resolve successfully on this subcontract.");
    uint256 endTime;
    if (block.timestamp < expiration) {
      endTime = block.timestamp;
    } else {
      endTime = expiration;
    }
    uint256 id = AffiliateOracle(AffiliateContract(owner).oracle()).getAffiliateTotal(affiliate, startTime, endTime);
    myRequests[id] = true;
  }

  function callback(uint256 _currentTotal, uint256 _id) public {
    require(msg.sender == AffiliateContract(owner).oracle(), "Only the oracle can call this method.");
    require(myRequests[_id], "This request is not in my pending list.");
    currentTotal = _currentTotal;
    totalLastUpdated = block.timestamp;
    delete myRequests[_id];
    emit CurrentTotalUpdatedEvent(_currentTotal, _id);
  }

  function affiliateResolve() public onlyAffiliate {
    require(expiration <= block.timestamp, "Subcontract not yet expired.");
    require(affiliateResolved == false, "Affiliate already called resolve successfully on this subcontract.");
    require(totalLastUpdated >= expiration, "Current total is not up to date, affiliate must call updateCurrentTotal().");
    AffiliateContract mainContract = AffiliateContract(owner);
    require(mainContract.contractExpiration() > block.timestamp, "Main contract expired.");
    uint totalSubcontracts = mainContract.totalSubcontracts();
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
      mainContract.affiliateResolve();
    }
  }

  function sellerResolve(address payable seller) public onlyMainContract {
    require(AffiliateContract(owner).contractExpiration() <= block.timestamp, "Main contract not yet expired.");
    selfdestruct(seller);
  }

  // This method is used for cleaning up the other subcontracts when one goes "bad" ie when the seller doesn't
  // make a new subcontract within the grace period. 
  function affiliateCleanup(address payable bs) public onlyMainContract {
    require(AffiliateContract(owner).contractExpiration() > block.timestamp, "Main contract expired.");
    require(AffiliateSubcontract(bs).gracePeriodExpired(), "Provided subcontract address does not have gracePeriodExpired flag set to true.");
    selfdestruct(affiliate);
  }
}