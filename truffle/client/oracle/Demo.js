const contract = require("@truffle/contract")
const getWeb3 = require('./getWeb3.js')
const AffiliateContractJSON = require('../src/contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('../src/contracts/AffiliateSubcontract.json')
const OracleJSON = require('../src/contracts/AffiliateOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000

const affiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode})

const affiliateSubcontract = contract({abi: AffiliateSubcontractJSON.abi})

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

async function filterEvents (callerContract,index) {
  try{

    callerContract.CurrentTotalUpdatedEvent()
  .on('data', event => console.log('SC' + index + ' * New CurrentTotalUpdated event. affiliateTotal: ' + event.currentTotal));
  //callerContract.events.CurrentTotalUpdatedEvent({ filter: { } }, async (err, event) => {
  //  if (err) { 
  //    console.error('Error on event', err)
  //  } 
  //  console.log('SC' + index + ' * New CurrentTotalUpdated event. affiliateTotal: ' + event.returnValues.currentTotal)
  //})
} catch(error){
  console.log(error)
}
}

async function init (nSC, scduration, sgpduration, scStake, incentiveFee, commissionRate ) {
  const web3js = await getWeb3.getWeb3()
  const accounts = await web3js.eth.getAccounts()
  const ownerAddr = accounts[0]
  const affiliateAddr = accounts[1]
  const networkId = await web3js.eth.net.getId()
  const oracleAddr =  OracleJSON.networks[networkId].address
  affiliateContract.setProvider(web3js.currentProvider)
  affiliateSubcontract.setProvider(web3js.currentProvider)
  const txVal = String(Number(incentiveFee) + Number(scStake))
  const scDuration = scduration * 60
  const SGPDuration = sgpduration * 60
  
  const mainContract = await affiliateContract.new(
    affiliateAddr,
    oracleAddr,
    nSC,
    scDuration,
    SGPDuration,
    web3js.utils.toWei(scStake),
    web3js.utils.toWei(incentiveFee),
    commissionRate,
    {from: ownerAddr, value: web3js.utils.toWei(txVal)}
  )
  console.log("deployed")
  const sc0addr = await mainContract.getCurrentSubcontract.call()
  sc0 = await affiliateSubcontract.at(sc0addr)

  try {
    filterEvents(sc0,0) 
  } catch(error){
    console.log(error)
  }
  console.log(mainContract.address) 
  console.log(sc0.address) 
  console.log(oracleAddr)
  return { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } 
}

(async () => {
  
  const { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } = await init(4, 600, 300, '1', '1', 10)
  await mainContract.setOracleAddress(oracleAddr, {from: ownerAddr})
  startTime = await sc0.startTime.call()

  console.log(startTime.toString())  
  const gas=await sc0.updateCurrentTotal.estimateGas({from: affiliateAddr})
  console.log(gas)
  await sc0.updateCurrentTotal({from: affiliateAddr,gas: 2000000})

  
  /*setInterval( async () => { 
    await subcontract.methods.updateCurrentTotal().send({ from: accounts[1], gas: 200000 })
  }, SLEEP_INTERVAL);*/

})()
