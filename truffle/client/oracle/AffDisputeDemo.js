const contract = require("@truffle/contract")
const getWeb3 = require('./getWeb3.js')
const AffiliateContractJSON = require('../src/contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('../src/contracts/AffiliateSubcontract.json')
const OracleJSON = require('../src/contracts/AffiliateOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000

const affiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode})

const affiliateSubcontract = contract({abi: AffiliateSubcontractJSON.abi})

let web3js = {}

const nSubcontracts = 4;
const sliceLength = 60;
const SGPlength = 30;
const commission = 10;
const IFammount= 1;
const sliceMPE= 1;
const sliceTimes=[]


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
  web3js = await getWeb3.getWeb3()
  const accounts = await web3js.eth.getAccounts()
  const ownerAddr = accounts[0]
  const affiliateAddr = accounts[1]
  const networkId = await web3js.eth.net.getId()
  const oracleAddr =  OracleJSON.networks[networkId].address
  affiliateContract.setProvider(web3js.currentProvider)
  affiliateSubcontract.setProvider(web3js.currentProvider)
  const txVal = String(Number(incentiveFee) + Number(scStake))
  //console.log("Seller Addr: "+ownerAddr)
  
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
  //console.log(mainContract.address) 
  //console.log(sc0.address) 
  console.log("Oracle Addr: "+oracleAddr)
  console.log("Affiliate Addr: "+affiliateAddr)
  console.log("Seller Addr: "+ownerAddr)
  return { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } 
}

//agp=300


async function updateCurrentTotal(scIndex,caller){
  console.log(caller+" Called updateCurrentTotal on SC"+scIndex)
  await contracts[""+scIndex].updateCurrentTotal({from: addresses[caller],gas: 2000000})
}

async function checkEarnings(scIndex,caller){
  console.log(caller+" checked earnings on SC"+scIndex)
  await contracts[""+scIndex].currentTotal.call() 
}

async function createNextSubContract(sliceIndex,caller){
  console.log(caller+" Called createNextSubContract on main contract to create SC"+sliceIndex)
  await contracts["main"].createNextSubContract({from: addresses[caller],gas: 2000000,value: web3js.utils.toWei(''+sliceMPE)})
}

async function getCurrentSubcontract(sliceIndex,caller){
  console.log(caller+" Called getCurrentSubcontract on main contract retreive address of SC"+sliceIndex)
  let addr=await contracts['main'].getCurrentSubcontract.call()
  let first=!contracts[sliceIndex]
  contracts[sliceIndex]=await affiliateSubcontract.at(addr)
  if(first) filterEvents(contracts[''+sliceIndex],sliceIndex) 
  console.log("Address: " +addr)
}

async function affiliateResolve(scIndex,caller){
  console.log(caller+" Called affiliateResolve SC"+scIndex)
  await contracts[''+scIndex].affiliateResolve({from: addresses[caller],gas: 2000000})
}

async function sellerResolve(caller){
  console.log(caller+" Called sellerResolve SC")
  await contracts['main'].sellerResolve({from: addresses[caller],gas: 2000000})
}

async function getNextSubcontract(scIndex,caller){
  console.log(caller+" Called sellerResolve SC")
  addr=await contracts[''+scIndex].nextSubcontract.call() 
  if(!Number(addr)){
    console.log("Address is null")
  }

}


let index = 0;
let contracts={}
let addresses={}

async function nextSlice() {
  console.log("TIME: Slice " + index + " ended");
  if(index+1<nSubcontracts){
    console.log("TIME: Slice " + (index+1) + " started");
    if(index!=nSubcontracts-1) console.log("TIME: SC" + (index+1) + " Seller Grace Period started");
  }
  else {
    console.log("TIME: Affiliate Grace Period started");
    setTimeout(function() {
      console.log("TIME: Affiliate Grace Period ended, Main contract expired");
      sliceActions('end')
    }, 300*1000);
    sliceActions('AGP')
  }

  setTimeout(function() { console.log("TIME: SC" + (index) + " Seller Grace Period ended"); }, SGPlength*1000);
  index += 1;
  sliceActions(index)
  
	if (index < nSubcontracts) {
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
      setTimeout(function() {createNextSubContract(1,"Seller")  }, (2.5*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(1,"Seller")  }, (4*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(1,"Affiliate")  }, (4.3*sliceLength/12)*1000);
      setTimeout(function() {affiliateResolve(0,"Affiliate")  }, (5*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(1,"Affiliate")  }, (6*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(1,"Affiliate")  }, (6.2*sliceLength/12)*1000);
      break;

    case 2:
      setTimeout(function() {updateCurrentTotal(1,"Affiliate")  }, (sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(1,"Affiliate")  }, (2*sliceLength/12)*1000);
      setTimeout(function() {createNextSubContract(2,"Seller")  }, (2.5*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(2,"Seller")  }, (4*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(2,"Affiliate")  }, (4.3*sliceLength/12)*1000);
      setTimeout(function() {affiliateResolve(1,"Affiliate")  }, (6*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (7*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(2,"Affiliate")  }, (7.2*sliceLength/12)*1000);
      break;

    case 3:
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (1*sliceLength/12)*1000);
      setTimeout(function() {checkEarnings(2,"Affiliate")  }, (2*sliceLength/12)*1000);
      //setTimeout(function() {createNextSubContract(3,"Seller")  }, (2.5*sliceLength/12)*1000);
      //setTimeout(function() {getCurrentSubcontract(3,"Seller")  }, (4*sliceLength/12)*1000);
      setTimeout(function() {getNextSubcontract(2,"Affiliate")  }, (7*sliceLength/12)*1000);
      setTimeout(function() {affiliateResolve(2,"Affiliate")  }, (8*sliceLength/12)*1000);
      break;

    case 'AGP':
      break;

    case 'end':
      break;
  }
}




(async () => {
  
  const { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } = await init(nSubcontracts, sliceLength, SGPlength, ''+sliceMPE, ''+IFammount, commission)
  addresses["Affiliate"]=affiliateAddr
  addresses["Seller"]=ownerAddr
  contracts['main']=mainContract
  contracts['0']=sc0
  console.log("addresses: "+JSON.stringify(addresses))
  await mainContract.setOracleAddress(oracleAddr, {from: ownerAddr})
  startTime = await sc0.startTime.call()
  var now = new Date()
  var nowEpoch = (Math.floor(now.getTime()/1000)) 
  setTimeout(nextSlice, (sliceLength-(nowEpoch-startTime))*1000);
  temp=Number(startTime)
  for(var i=0; i<nSubcontracts;i++){
    sliceTimes[i]=temp
    temp+=sliceLength
  }
  sliceActions(0)

  

  //console.log(""+Math.floor(now.getTime()/1000))
  //console.log(""+Math.floor(now.getUTCMilliseconds()/1000))
  //console.log(""+nowEpoch)
  console.log("Start Time:"+startTime)

  //console.log(((nowEpoch-startTime)).toString())  
  //const gas=await sc0.updateCurrentTotal.estimateGas({from: affiliateAddr})
  //console.log(gas)
  //await sc0.updateCurrentTotal({from: affiliateAddr,gas: 2000000})



  /*setInterval( async () => { 
    await subcontract.methods.updateCurrentTotal().send({ from: accounts[1], gas: 200000 })
  }, SLEEP_INTERVAL);*/

})()
