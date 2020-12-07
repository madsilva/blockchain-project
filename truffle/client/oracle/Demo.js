const getWeb3 = require('./getWeb3.js')
const AffiliateContractJSON = require('../src/contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('../src/contracts/AffiliateSubcontract.json')
const OracleJSON = require('../src/contracts/AffiliateOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000

async function getCallerContract (web3js, ownerAddress) {
  const networkId = await web3js.eth.net.getId()
  const oracleAddress =  OracleJSON.networks[networkId].address
  var mainContract = new web3js.eth.Contract(AffiliateContractJSON.abi, options={gas: 100000000000})
  const accounts = await web3js.eth.getAccounts()
  const affiliate = accounts[1]

  const arguments = [affiliate, oracleAddress, 4, 600, 300, 1000000, 1000000, 10]

  const gas = await mainContract.deploy({data: AffiliateContractJSON.bytecode, arguments: arguments}).estimateGas({value: 2000000});
  mainContract = await mainContract.deploy(
    {data: AffiliateContractJSON.bytecode, arguments: arguments})
    .send({from: ownerAddress, value: 2000000, gas: gas + 100})
  const receipt = await mainContract.methods.getMainContractStateInfo().send({from: ownerAddress, gas: 2000000})

  const subcontract = await new web3js.eth.Contract(AffiliateSubcontractJSON.abi, receipt.events.GetMainContractStateInfoEvent.returnValues.currentSubcontract)
  return { subcontract, mainContract }
}

async function filterEvents (callerContract) {
  callerContract.events.CurrentTotalUpdatedEvent({ filter: { } }, async (err, event) => {
    if (err) { 
      console.error('Error on event', err)
    } 
    console.log('* New CurrentTotalUpdated event. affiliateTotal: ' + event.returnValues.currentTotal)
  })
}

async function init () {
  const web3js = await getWeb3.getWeb3()
  const accounts = await web3js.eth.getAccounts()
  const ownerAddress = accounts[0]
  const { subcontract, mainContract } = await getCallerContract(web3js, ownerAddress)
  filterEvents(subcontract)
  return { subcontract, mainContract, ownerAddress, web3js }
}

(async () => {
  const { subcontract, mainContract, ownerAddress, web3js } = await init()
  const networkId = await web3js.eth.net.getId()
  const accounts = await web3js.eth.getAccounts()
  const oracleAddress =  OracleJSON.networks[networkId].address
  await mainContract.methods.setOracleAddress(oracleAddress).send({ from: ownerAddress, gas: 2000000 })



  /*setInterval( async () => {
    await subcontract.methods.updateCurrentTotal().send({ from: accounts[1], gas: 200000 })
  }, SLEEP_INTERVAL);*/

})()
