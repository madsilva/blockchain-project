const getWeb3 = require('./src/getWeb3.js')
const AffiliateContractJSON = require('../build/contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('../build/contracts/AffiliateSubcontract.json')
const OracleJSON = require('../build/contracts/EthPriceOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000
//const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || './caller/caller_private_key'

async function getCallerContract (web3js, ownerAddress) {
  const networkId = await web3js.eth.net.getId()
  var mainContract = new web3js.eth.Contract(AffiliateContractJSON.abi, options={gas: 100000000000000})
  const accounts = await web3js.eth.getAccounts()
  const affiliate = accounts[1]
  web3js.eth.personal.unlockAccount(ownerAddress, "", 600)
  .then(console.log('Account unlocked!'));


  const arguments = [affiliate, 3, 600, 300, 1000000, 1000000, 10]
  console.log("estimating gas")
  const gas = await mainContract.deploy({data: AffiliateContractJSON.bytecode, arguments: arguments}).estimateGas({value: 2000000});
  console.log("aaaa")
  console.log(gas)
  mainContract = await mainContract.deploy(
    {data: AffiliateContractJSON.bytecode, arguments: arguments})
    .send({from: ownerAddress, value: 2000000, gas: gas + 100})
  console.log("main contract deployed")
  console.log(mainContract.options.address)
  const receipt = await mainContract.methods.getCurrentSubcontract().send({from: ownerAddress, gas: 2000000})

  console.log(receipt.events.GetCurrentSubcontractEvent.returnValues.sc)
  const subContract = await new web3js.eth.Contract(AffiliateSubcontractJSON.abi, receipt.events.GetCurrentSubcontractEvent.returnValues.sc)
  //console.log(subContract)
  console.log(subContract.options.address)
  console.log(subContract.options)
  console.log(typeof subContract)
  return { subContract, mainContract }

  
}

async function filterEvents (callerContract) {
  callerContract.events.PriceUpdatedEvent({ filter: { } }, async (err, event) => {
    if (err) console.error('Error on event', err)
    console.log('* New PriceUpdated event. ethPrice: ' + event.returnValues.ethPrice)
  })
  callerContract.events.ReceivedNewRequestIdEvent({ filter: { } }, async (err, event) => {
    console.log("received new request id event")
    if (err) console.error('Error on event', err)
  })
}

async function init () {
  const web3js = await getWeb3.getWeb3()
  const accounts = await web3js.eth.getAccounts()
  const ownerAddress = accounts[0]
  console.log("owner: " + ownerAddress)
  const { subContract, mainContract } = await getCallerContract(web3js, ownerAddress)
  console.log(typeof subContract)
  console.log(mainContract.options)
  console.log(subContract.options)
  filterEvents(subContract)
  return { subContract, mainContract, ownerAddress, web3js }
}

(async () => {
  const { subContract, mainContract, ownerAddress, web3js } = await init()
  console.log("caller contract is " + typeof subContract)
  const networkId = await web3js.eth.net.getId()
  const accounts = await web3js.eth.getAccounts()
  const oracleAddress =  OracleJSON.networks[networkId].address
  await mainContract.methods.setOracleAddress(oracleAddress).send({ from: ownerAddress, gas: 2000000 })
  setInterval( async () => {
    await subContract.methods.updateCurrentTotal().send({ from: accounts[1], gas: 200000 })
  }, SLEEP_INTERVAL);
})()
