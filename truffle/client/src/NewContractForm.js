import React from 'react'
import {Form, FormGroup, Input, Button, Label} from 'reactstrap'

var contract = require("@truffle/contract")
const AffiliateContractJSON = require('./contracts/AffiliateContract.json')
const AffiliateOracleJSON = require('./contracts/AffiliateOracle.json') 

class NewContractForm extends React.Component {
  constructor(props) {
    super(props)
    this.web3 = props.web3
    this.affiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode})
    this.affiliateContract.setProvider(this.web3.currentProvider)
    this.affiliateOracle = contract({abi: AffiliateOracleJSON.abi, bytecode: AffiliateOracleJSON.bytecode})
    this.affiliateOracle.setProvider(this.web3.currentProvider)
    // Note: all monetary amounts are in Ether and all time amounts are in minutes.
    this.state = {
      affiliateAddress: '',
      oracleAddress: '',
      subcontractStake: 1,
      totalSubcontracts: 3,
      subcontractDuration: 1,
      sellerGracePeriodDuration: 1,
      contractEndGracePeriodDuration: 1,
      // Integer percentage
      affiliateRate: 10,
      incentiveFee: 1
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCreateNewContract = this.handleCreateNewContract.bind(this)
    this.handleGetOracleAddress = this.handleGetOracleAddress.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target
    this.state[name] = value
    this.setState(this.state)
  }

  async getAccount() {
    const accounts = await this.web3.eth.getAccounts()
    if (accounts.length > 0) {
      return accounts[0]
    } else {
      return null
    }
  }

  printErrorMessage(error) {
    if (error.message.startsWith("Internal JSON-RPC error.")) {
      const message = JSON.parse(error.message.replace("Internal JSON-RPC error.", ""))
      console.log("Internal JSON-RPC error: " + message.message)
    } else {
      console.log(error)
    }
  }

  getByteString(rawRate) {
    // Converting the affiliate commission percentage to the necessary bit string.
    let h = 100
    let t = h*1000000
    let r = rawRate*1000000
    let rate = ''
    for (var i = 0; i < 32; i++) {
      if (t > r) {
        rate += '03'
      } else if (t <= r) {
        rate += '13'
        r -= t
      }
      t /= 2
    }
    rate += "x0"
    var rrate = rate.split("").reverse().join("")
    return rrate
  }

  async handleCreateNewContract(event) {
    try {
      const account = await this.getAccount()
      // The duration values need to be converted into seconds, currently they are given in minutes.
      const newContract = await this.affiliateContract.new(
        this.state.affiliateAddress,
        this.state.oracleAddress,
        this.state.totalSubcontracts,
        Number(this.state.subcontractDuration) * 60,
        Number(this.state.sellerGracePeriodDuration) * 60,
        Number(this.state.contractEndGracePeriodDuration) * 60,
        this.web3.utils.toWei(String(this.state.subcontractStake)),
        this.web3.utils.toWei(String(this.state.incentiveFee)),
        this.getByteString(Number(this.state.affiliateRate)),
        {from: account, value: this.web3.utils.toWei(String(Number(this.state.incentiveFee) + Number(this.state.subcontractStake)))}
      )
      console.log("address: " + newContract.address)
      const subcontract = await newContract.getCurrentSubcontract.call()
      console.log("first subcontract: " + subcontract)
    } catch(err) {
      this.printErrorMessage(err)
    }
  }

  async handleGetOracleAddress(event) {
    const networkId = await this.web3.eth.net.getId()
    this.affiliateOracle.setNetwork(networkId)
    const address = AffiliateOracleJSON.networks[networkId].address
    const oracle = await this.affiliateOracle.at(address)
    console.log("oracle address: " + address)
  }

  render() {
    return(<React.Fragment>
    <Form id="inputForm">
      <h2>Create a new affiliate contract</h2>
      <h3>The current account in Metamask will be the owner of this contract.</h3>
      <Button color="primary" form='inputForm' onClick={ this.handleGetOracleAddress }>Get default oracle address</Button>
      <FormGroup>
        <Label for="affiliateAddress">Affiliate's Ethereum Wallet Address</Label>
        <Input
          type="text"
          name = "affiliateAddress"
          defaultValue={this.state.affiliateAddress}
          onChange={this.handleInputChange}
          id="affiliateAddress" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="affiliateAddress">Oracle Address</Label>
        <Input
          type="text"
          name = "oracleAddress"
          defaultValue={this.state.oracleAddress}
          onChange={this.handleInputChange}
          id="oracleAddress"
        />
      </FormGroup>
      <FormGroup>
        <Label for="subcontractStake">Subcontract stake, in Ether</Label>
        <Input
          type="number"
          name = "subcontractStake"
          defaultValue={this.state.subcontractStake}
          onChange={this.handleInputChange}
          id="subcontractStake"
          min={0} 
          step={.1}
        />
      </FormGroup>
      <FormGroup>
        <Label for="totalSubcontracts">Number of Subcontracts (min 3)</Label>
        <Input
          type="number"
          name = "totalSubcontracts"
          defaultValue={this.state.totalSubcontracts}
          onChange={this.handleInputChange}
          id="totalSubcontracts"
          min={3} 
          max={100}
          step={1}
        />
      </FormGroup>
      <FormGroup>
        <Label for="incentiveFee">Incentive Fee amount, in Ether</Label>
        <Input
          type="number"
          name = "incentiveFee"
          defaultValue={this.state.incentiveFee}
          onChange={this.handleInputChange}
          id="incentiveFee"
          min={0} 
          step={1}
        />
      </FormGroup>
      <FormGroup>
        <Label for="affiliateRate">Commission Rate, as an integer percentage</Label>
        <Input
          type="number"
          name = "affiliateRate"
          defaultValue={this.state.affiliateRate}
          onChange={this.handleInputChange}
          id="affiliateRate"
          min={0} 
          max={100}
          step={.5}
        />
      </FormGroup>
      <FormGroup>
        <Label for="sellerGracePeriodDuration">Seller Grace Period Length, in minutes</Label>
        <Input
          type="number"
          name = "sellerGracePeriodDuration"
          defaultValue={this.state.sellerGracePeriodDuration}
          onChange={this.handleInputChange}
          id="sellerGracePeriodDuration"
          min={1} 
          step={1}
        />
      </FormGroup>
      <FormGroup>
        <Label for="subcontractDuration">Subcontract duration, in minutes</Label>
        <Input
          type="number"
          name = "subcontractDuration"
          defaultValue={this.state.subcontractDuration}
          onChange={this.handleInputChange}
          id="subcontractDuration"
          min={0} 
          step={1}
        />
      </FormGroup>
      <FormGroup>
        <Label for="contractEndGracePeriodDuration">Contract end grace period duration, in minutes</Label>
        <Input
          type="number"
          name = "contractEndGracePeriodDuration"
          defaultValue={this.state.contractEndGracePeriodDuration}
          onChange={this.handleInputChange}
          id="contractEndGracePeriodDuration"
          min={0} 
          step={1}
        />
      </FormGroup>
      <Button color="primary" form='inputForm' onClick={ this.handleCreateNewContract }>Submit</Button>
    </Form>
    </React.Fragment>)
  }
}

export default NewContractForm
