const AffiliateOracle = artifacts.require('./AffiliateOracle.sol');

module.exports = function (deployer) {
  deployer.deploy(AffiliateOracle);
}