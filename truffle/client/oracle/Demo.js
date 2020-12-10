const contract = require("@truffle/contract")
const getWeb3 = require('./getWeb3.js')
const AffiliateContractJSON = require('../src/contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('../src/contracts/AffiliateSubcontract.json')
const OracleJSON = require('../src/contracts/AffiliateOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000

const affiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode})

const affiliateSubcontract = contract({abi: AffiliateSubcontractJSON.abi})

const nSubcontracts = 4;
const sliceLength = 60;
const SGPlength = 30;
const commission = 10;

async function filterEvents (callerContract,index) {
  try{

    callerContract.CurrentTotalUpdatedEvent()
  .on('data', event => console.log('SC' + index + ' * New CurrentTotalUpdated event. affiliateTotal: ' + event.returnValues.currentTotal));
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

async function init (nSC, scDuration, SGPDuration, scStake, incentiveFee, commissionRate ) {
  const web3js = await getWeb3.getWeb3()
  const accounts = await web3js.eth.getAccounts()
  const ownerAddr = accounts[0]
  const affiliateAddr = accounts[1]
  const networkId = await web3js.eth.net.getId()
  const oracleAddr =  OracleJSON.networks[networkId].address
  affiliateContract.setProvider(web3js.currentProvider)
  affiliateSubcontract.setProvider(web3js.currentProvider)
  const txVal = String(Number(incentiveFee) + Number(scStake))

  
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

//agp=300


async function updateCurrentTotal(scIndex,caller){
  console.log(caller+" Called updateCurrentTotal on SC"+scIndex)
  await contracts[""+scIndex].updateCurrentTotal({from: addreses[caller],gas: 2000000})
}

async function checkEarnings(scIndex,caller){
  console.log(caller+" Called checked earnings on SC"+scIndex)
  await contracts[""+scIndex].currentTotal.call() 
}

async function createNextSubContract(sliceIndex,caller){
  console.log(caller+" Called createNextSubContract on main contract to create SC"+sliceIndex)
  addr=await contracts["main"].createNextSubContract({from: addreses[caller],gas: 2000000})
  contracts[sliceIndex]=await affiliateSubcontract.at(addr)
}


let index = 0;
let contracts={}
let addresses={}

async function nextSlice() {
  console.log("TIME: Slice " + index + " ended");
  console.log("TIME: Slice " + (index+1) + " started");
  console.log("SC" + (index+1) + ": SGP started");
  setTimeout(function() { console.log("SC" + (index) + ": SGP ended"); }, SGPlength*1000);
  index += 1;
  sliceActions(index)
  
	if (index <= nSubcontracts) {
		setTimeout(nextSlice, sliceLength*1000);
    }
}

async function sliceActions(slice) {
  switch(slice){
    case 0:
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(0,"Affiliate")  }, (2*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (3*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(0,"Affiliate")  }, (4*sliceLength/12)*1000);
      break;

    case 1:
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(0,"Affiliate")  }, (2*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (3*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(0,"Affiliate")  }, (4*sliceLength/12)*1000);
      break;

    case 2:
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(2,"Affiliate")  }, (2*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (3*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(2,"Affiliate")  }, (4*sliceLength/12)*1000);
      break;

    case 3:
      setTimeout(function() {updateCurrentTotal(3,"Affiliate")  }, (sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(3,"Affiliate")  }, (2*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(3,"Affiliate")  }, (3*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(3,"Affiliate")  }, (4*sliceLength/12)*1000);
      break;
  }
}




(async () => {
  
  const { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } = await init(nSubcontracts, sliceLength, SGPlength, '1', '1', commission)
  addresses["Affiliate"]=affiliateAddr
  addresses["Seller"]=ownerAddr
  contracts['main']=mainContract
  contracts['0']=sc0

  await mainContract.setOracleAddress(oracleAddr, {from: ownerAddr})
  startTime = await sc0.startTime.call()
  const now = new Date()  
  const nowEpoch = (Math.floor(now.getTime()/1000) + now.getTimezoneOffset()*60) 
  setTimeout(nextSlice, (sliceLength-(nowEpoch-startTime))*1000);
  sliceActions(0)
  console.log(now.get)
  console.log(""+nowEpoch)
  console.log(""+startTime)

  console.log(((nowEpoch-startTime)).toString())  
  //const gas=await sc0.updateCurrentTotal.estimateGas({from: affiliateAddr})
  //console.log(gas)
  //await sc0.updateCurrentTotal({from: affiliateAddr,gas: 2000000})



  /*setInterval( async () => { 
    await subcontract.methods.updateCurrentTotal().send({ from: accounts[1], gas: 200000 })
  }, SLEEP_INTERVAL);*/

})()
