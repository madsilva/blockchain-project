const BN = require('bn.js')
const bent = require('bent')
const getJSON = bent('json');
const getWeb3 = require('./getWeb3.js')
const OracleJSON = require('../src/contracts/AffiliateOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000
const CHUNK_SIZE = process.env.CHUNK_SIZE || 3
const MAX_RETRIES = process.env.MAX_RETRIES || 5
var pendingRequests = []
//Location of file with simulated api response from python code
var url="http://0.0.0.0:8000/test.json";
//the affiliate code to look for in the file
var affcode="testbbbb"

async function getOracleContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(OracleJSON.abi, OracleJSON.networks[networkId].address)
}

async function filterEvents (oracleContract) {
  oracleContract.events.GetAffiliateTotalEvent(async (err, event) => {
    if (err) {
      console.error('Error on event', err)
      return
    }
    await addRequestToQueue(event)
  })
  oracleContract.events.SetAffiliateTotalEvent(async (err, event) => {
    if (err) {
      console.error('Error on event', err)
    }
    // Do something
  })
}

async function addRequestToQueue (event) {
  const callerAddress = event.returnValues.callerAddress
  const id = event.returnValues.id
  const affiliate = event.returnValues.affiliate
  const startTime = event.returnValues.startTime
  const endTime = event.returnValues.endTime
  pendingRequests.push({ callerAddress, id, affiliate, startTime, endTime })
}

async function processQueue (oracleContract, ownerAddress) {
  let processedRequests = 0
  while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
    const req = pendingRequests.shift()
    await processRequest(oracleContract, ownerAddress, req.callerAddress, req.id, req.affiliate, req.startTime, req.endTime)
    processedRequests++
  }
}

async function processRequest (oracleContract, ownerAddress, callerAddress, id, affiliate, startTime, endTime) {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const affiliateTotal = await retrieveAffiliateTotal(affiliate, startTime, endTime)
      console.log("Affiliate address: " + affiliate + " has a total of " + affiliateTotal)
      await setAffiliateTotal(oracleContract, callerAddress, ownerAddress, affiliateTotal, id)
      return
    } catch (error) {
      if (retries === MAX_RETRIES - 1) {
        console.log("hit max retries")
        await setAffiliateTotal(oracleContract, callerAddress, ownerAddress, '0', id)
        return
      }
      retries++
    }
  }
}

async function setAffiliateTotal (oracleContract, callerAddress, ownerAddress, affiliateTotal, id) {
  try {
    await oracleContract.methods.setAffiliateTotal(affiliateTotal, callerAddress, id).send({ from: ownerAddress })
  } catch (error) {
    console.log(affiliateTotal)
    console.log('Error encountered while calling setAffiliateTotal.')
  }
}

async function retrieveAffiliateTotal(affiliate, startTime, endTime) {
  total=0
  total2=0
  //get sales record
  let obj = await getJSON(url)

  /*try {
    var startiso = new Date(startTime*1000).toISOString();
    var endiso = new Date(endTime*1000).toISOString();
    console.log(startTime)
    console.log(startiso)
    console.log(endTime)
    console.log(endiso)
  } catch (error){
    console.log(error)
  }*/
  //filter relevant sales and sum
  var data = JSON.parse(JSON.stringify(obj), function(key, value) { 

    /*if ( (value.affiliate_code === affcode) ) {
      total2+=(parseInt(value.total)); 
      console.log((Date.parse(value.timestamp)/1000))
      console.log(startTime)
      console.log((Date.parse(value.timestamp)/1000 >= startTime))
      console.log(endTime)
      console.log((Date.parse(value.timestamp)/1000 < endTime))
   }*/
    if ( (value.affiliate_code === affiliate) && (Date.parse(value.timestamp)/1000 >= startTime) && (Date.parse(value.timestamp)/1000 < endTime) ) {
       total+=(parseInt(value.total));
       console.log("true")
    }
    return value; }) 
  console.log(total)
  //console.log(total2)
  return total.toString();
}

async function init () {
  const web3js = await getWeb3.getWeb3()
  const accounts = await web3js.eth.getAccounts()
  const ownerAddress = accounts[0]
  const oracleContract = await getOracleContract(web3js)
  filterEvents(oracleContract, web3js)
  return { oracleContract, ownerAddress }
}

(async () => {
  const { oracleContract, ownerAddress } = await init()
  setInterval(async () => {
    console.log("Oracle address is: " + oracleContract.options.address)
    await processQueue(oracleContract, ownerAddress)
  }, SLEEP_INTERVAL)
})()
