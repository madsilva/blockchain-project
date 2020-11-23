const getWeb3 = require('./src/getWeb3.js')
const CallerJSON = require('../build/contracts/CallerContract.json')
const OracleJSON = require('../build/contracts/EthPriceOracle.json')

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000
//const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || './caller/caller_private_key'

async function getCallerContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(CallerJSON.abi, CallerJSON.networks[networkId].address)
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
  const callerContract = await getCallerContract(web3js)
  filterEvents(callerContract)
  return { callerContract, ownerAddress, web3js }
}

(async () => {
  const { callerContract, ownerAddress, web3js } = await init()
  const networkId = await web3js.eth.net.getId()
  const oracleAddress =  OracleJSON.networks[networkId].address
  await callerContract.methods.setOracleInstanceAddress(oracleAddress).send({ from: ownerAddress })
  setInterval( async () => {
    await callerContract.methods.updateEthPrice().send({ from: ownerAddress, gas: 200000 })
  }, SLEEP_INTERVAL);
})()
