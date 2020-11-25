const BN = require('bn.js')
const bent = require('bent')
const getJSON = bent('json');
const getWeb3 = require('./src/getWeb3.js')
const OracleJSON = require('../build/contracts/EthPriceOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000
const CHUNK_SIZE = process.env.CHUNK_SIZE || 3
const MAX_RETRIES = process.env.MAX_RETRIES || 5
//const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || './oracle/oracle_private_key'

var pendingRequests = []
//Location of file with simulated api response from python code
var url="http://0.0.0.0:8000/test.json";
//the affiliate code to look for in the file
var affcode="testbbbb"

async function getOracleContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(OracleJSON.abi, OracleJSON.networks[networkId].address)
}

async function filterEvents (oracleContract, web3js) {
  oracleContract.events.GetLatestEthPriceEvent(async (err, event) => {
    if (err) {
      console.error('Error on event', err)
      return
    }
    await addRequestToQueue(event)
  })

  oracleContract.events.SetLatestEthPriceEvent(async (err, event) => {
    if (err) console.error('Error on event', err)
    // Do something
  })
}

async function addRequestToQueue (event) {
  const callerAddress = event.returnValues.callerAddress
  const id = event.returnValues.id
  const startTime = event.returnValues.startTime
  const endTime = event.returnValues.endTime
  pendingRequests.push({ callerAddress, id, startTime, endTime })
}

async function processQueue (oracleContract, ownerAddress) {
  let processedRequests = 0
  while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
    const req = pendingRequests.shift()
    await processRequest(oracleContract, ownerAddress, req.id, req.callerAddress, req.startTime, req.endTime)
    processedRequests++
  }
}

async function processRequest (oracleContract, ownerAddress, id, callerAddress, startTime, endTime) {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      const ethPrice = await retrieveLatestEthPrice(startTime, endTime)
      console.log(ethPrice)
      await setLatestEthPrice(oracleContract, callerAddress, ownerAddress, ethPrice, id)
      return
    } catch (error) {
      if (retries === MAX_RETRIES - 1) {
        console.log("hit max retries")
        await setLatestEthPrice(oracleContract, callerAddress, ownerAddress, '0', id)
        return
      }
      retries++
    }
  }
}

async function setLatestEthPrice (oracleContract, callerAddress, ownerAddress, ethPrice, id) {
  try {
    await oracleContract.methods.setLatestEthPrice(ethPrice, callerAddress, id).send({ from: ownerAddress })
    
  } catch (error) {
    console.log(ethPrice)
    console.log(ethPrice.toString())
    console.log('Error encountered while calling setLatestEthPrice.')
    // Do some error handling
  }
}

async function retrieveLatestEthPrice(startTime, endTime) {
  total=0
  //get sales record
  let obj = await getJSON(url)
  //filter relevant sales and sum
  var data = JSON.parse(JSON.stringify(obj), function(key, value) { 
    if ( value.affiliate_code === affcode ) total+=(parseInt(value.total)); 
    return value; })
  console.log(total)
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
    await processQueue(oracleContract, ownerAddress)
  }, SLEEP_INTERVAL)
})()
