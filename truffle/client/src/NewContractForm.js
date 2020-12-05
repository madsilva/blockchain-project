import React from 'react'
import {Form, FormGroup, Input, Button, Label} from 'reactstrap'

var contract = require("@truffle/contract")
const AffiliateContractJSON = require('./contracts/AffiliateContract.json')

class NewContractForm extends React.Component {
  constructor(props) {
    super(props)
    this.web3 = props.web3
    this.affiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode})
    this.affiliateContract.setProvider(this.web3.currentProvider)
    this.state = {
      // Affilate wallet address
      affiliateAddress: '',
      // Oracle address
      oracleAddress: '',
      // funds staked per SC
      subcontractStake: 0,
      //number of subcontracts (minimum:3)
      totalSubcontracts: 3,
      //length of each subcontract in days
      subcontractDuration: 7,
      //length of seller grace period after each SC period, hours
      sellerGracePeriodDuration: 1,
      //comission affiliateRate, %
      affiliateRate: 5,
      //Incentive fee amount
      incentiveFee: 3
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCreateNewContract = this.handleCreateNewContract.bind(this)
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

  async handleCreateNewContract(event) {
    try {
      const account = await this.getAccount()
      const txVal = Number(this.state.incentiveFee) + Number(this.state.subcontractStake)
      const newContract = await this.affiliateContract.new(
        this.state.affiliateAddress,
        this.state.oracleAddress,
        this.state.totalSubcontracts,
        this.state.subcontractDuration,
        this.state.sellerGracePeriodDuration,
        this.state.subcontractStake,
        this.state.incentiveFee,
        this.state.affiliateRate,
        {from: account, value: txVal}
      )
      console.log(newContract.address)
    } catch(err) {
      console.log(err)
    }
  }

  render() {
    return(<React.Fragment>
    <Form id="inputForm" onSubmit={ this.handleSubmit }>
      <h2>Create a new affiliate contract</h2>
      <h3>The current account in Metamask will be the owner of this contract.</h3>
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
        <Label for="subcontractStake">Subcontract stake</Label>
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
        <Label for="totalSubcontracts">Number of Subcontracts</Label>
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
        <Label for="incentiveFee">Incentive Fee amount (eth)</Label>
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
        <Label for="affiliateRate">Commission Rate</Label>
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
        <Label for="sellerGracePeriodDuration">Seller Grace Period Length (hours)</Label>
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
        <Label for="subcontractDuration">Subcontract duration (days)</Label>
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
      <Button color="primary" form='inputForm' onClick={ this.handleCreateNewContract }>Submit</Button>
    </Form>
    </React.Fragment>)
  }
}

export default NewContractForm
