const contract = require("@truffle/contract")
const getWeb3 = require('./getWeb3.js')
const AffiliateContractJSON = require('../src/contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('../src/contracts/AffiliateSubcontract.json')
const OracleJSON = require('../src/contracts/AffiliateOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000

const affiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode})

const affiliateSubcontract = contract({abi: AffiliateSubcontractJSON.abi})

let web3js = {}

const gasSpending={'Seller':0,'Affiliate':0}
const nSubcontracts = 4;
const sliceLength = 100;
const SGPlength = 50;
const AGPlength = 50;
const commission = "0x3030313130303131303031313030313130303131303031313030313130303030";
const IFammount= 1;
const sliceMPE= 1;

function logColor(message,color){
  colors={
          "blue":"\x1b[34m",
          "yellow":"\x1b[33m",
          "magenta":"\x1b[35m",
          "cyan":"\x1b[36m",
          'red':"\x1b[31m",
        }
  console.log(colors[color],message,"\x1b[37m\x1b[0m")
  }


async function filterEvents (callerContract,index) {
  try{

    callerContract.CurrentTotalUpdatedEvent()
  .on('data', event => logColor('Oracle Response: Slice ' + index + ' sales:' + event.returnValues.currentTotal,"cyan"));
} catch(error){
  console.log(error)
}
}

async function init (nSC, scDuration, SGPDuration,AGPDuration, scStake, incentiveFee, commissionRate ) {
  web3js = await getWeb3.getWeb3()
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
    AGPDuration,
    web3js.utils.toWei(scStake),
    web3js.utils.toWei(incentiveFee),
    commissionRate,
    10,
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
  console.log("Oracle Addr: "+oracleAddr)
  console.log("Affiliate Addr: "+affiliateAddr)
  console.log("Seller Addr: "+ownerAddr)
  return { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } 
}

async function gaslog(caller,tx){
  gasUsed=tx['receipt']["gasUsed"]
  gasSpending[caller]+=gasUsed
  logColor("   gas used: "+gasUsed+"","red")

}

async function updateCurrentTotal(scIndex,caller){
  console.log(caller+" Called updateCurrentTotal on SC"+scIndex)
  gaslog(caller,await contracts[""+scIndex].updateCurrentTotal({from: addresses[caller],gas: 2000000}))
}

async function checkSales(scIndex,caller){
  console.log(caller+" checked sales on SC"+scIndex)
  await contracts[""+scIndex].currentTotal.call() 
}

async function createNextSubContract(sliceIndex,caller){
  console.log(caller+" Called createNextSubContract on main contract to create SC"+sliceIndex)
  gaslog(caller,await contracts["main"].createNextSubContract({from: addresses[caller],gas: 2000000,value: web3js.utils.toWei(''+sliceMPE)}))
}

async function getCurrentSubcontract(sliceIndex,caller){
  console.log(caller+" Called getCurrentSubcontract on main contract retreive address of SC"+sliceIndex)
  let addr=await contracts['main'].getCurrentSubcontract.call()
  let first=!contracts[sliceIndex]
  contracts[sliceIndex]=await affiliateSubcontract.at(addr)
  if(first) filterEvents(contracts[''+sliceIndex],sliceIndex) 
  logColor("   address: " +addr,"yellow")
}

async function affiliateResolve(scIndex,caller){

  console.log(caller+" Called affiliateResolve on SC"+scIndex)
  gaslog(caller,await contracts[''+scIndex].affiliateResolve({from: addresses[caller],gas: 2000000}))
}

async function sellerResolve(caller){
  console.log(caller+" Called sellerResolve SC")
  gaslog(caller,await contracts['main'].sellerResolve({from: addresses[caller],gas: 2000000}))
}

async function getNextSubcontract(scIndex,caller){
  console.log(caller+" Called getNextSubcontract on SC"+scIndex)
  addr=await contracts[''+scIndex].nextSubcontract.call() 
  if(!Number(addr)){
    logColor("   address: null","yellow")
  }

}


let index = 0;
let contracts={}
let addresses={}

async function nextSlice() {
  logColor("TIME: Slice " + index + " ended","magenta");
  if(index+1<nSubcontracts){
    logColor("TIME: Slice " + (index+1) + " started","magenta");
    if(index+1<nSubcontracts){
      let temp=index
      logColor("TIME: SC" + (index) + " Seller Grace Period started","magenta");
      setTimeout(function() { logColor("TIME: SC" + (temp) + " Seller Grace Period ended","magenta"); }, SGPlength*1000);
    }
  }
  else {
    logColor("TIME: Affiliate Grace Period started","magenta");
    setTimeout(function() {
      logColor("TIME: Affiliate Grace Period ended, Main contract expired","magenta");
      sliceActions('end')
    }, AGPlength*1000);
    sliceActions('AGP')
  }
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
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (3*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (5*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (7*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (9*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (11*sliceLength/12)*1000);
      break;

    case 1:
      setTimeout(function() {updateCurrentTotal(0,"Affiliate")  }, (sliceLength/12)*1000);
      setTimeout(function() {createNextSubContract(1,"Seller")  }, (2.5*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(1,"Seller")  }, (4*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(1,"Affiliate")  }, (4.1*sliceLength/12)*1000);
      setTimeout(function() {affiliateResolve(0,"Affiliate")  }, (5*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(1,"Affiliate")  }, (6*sliceLength/12)*1000);
      break;

    case 2:
      setTimeout(function() {createNextSubContract(2,"Seller")  }, (1*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(2,"Seller")  }, (2*sliceLength/12)*1000);
      setTimeout(function() {getCurrentSubcontract(2,"Affiliate")  }, (2.1*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(1,"Affiliate")  }, (3*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (5*sliceLength/12)*1000);
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (6*sliceLength/12)*1000);
      setTimeout(function() {affiliateResolve(1,"Affiliate")  }, (7*sliceLength/12)*1000);
      break;

    case 3:
      setTimeout(function() {updateCurrentTotal(2,"Affiliate")  }, (1*sliceLength/12)*1000);
      setTimeout(function() {checkSales(2,"Affiliate")  }, (2*sliceLength/12)*1000);
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
  
  const { sc0, mainContract, ownerAddr, affiliateAddr, oracleAddr, web3js } = await init(nSubcontracts, sliceLength, SGPlength,AGPlength, ''+sliceMPE, ''+IFammount, commission)
  addresses["Affiliate"]=affiliateAddr
  addresses["Seller"]=ownerAddr
  contracts['main']=mainContract
  contracts['0']=sc0
  //console.log("Seller called setOracleAddress")
  //gaslog("Seller",await mainContract.setOracleAddress(oracleAddr, {from: ownerAddr}))
  startTime = await sc0.startTime.call()
  var now = new Date() 
  var nowEpoch = (Math.floor(now.getTime()/1000)) 
  setTimeout(nextSlice, (sliceLength-(nowEpoch-startTime))*1000);
  temp=Number(startTime)
  sliceActions(0)
  console.log("Start Time:"+startTime)
})()
