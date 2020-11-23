const EthPriceOracle = artifacts.require('./EthPriceOracle.sol');

module.exports = function (deployer) {
  deployer.deploy(EthPriceOracle);
}