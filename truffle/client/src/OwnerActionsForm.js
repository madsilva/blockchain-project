import React from 'react'
import {Form, FormGroup, Input, Button, Label} from 'reactstrap'

var contract = require("@truffle/contract")
const AffiliateContractJSON = require('./contracts/AffiliateContract.json')

class OwnerActionsForm extends React.Component {
  constructor(props) {
    super(props)
    this.web3 = props.web3
    this.affiliateContract = contract({abi: AffiliateContractJSON.abi})
    this.affiliateContract.setProvider(this.web3.currentProvider)
    this.state = {
      mainContractAddress: '',
      txValue: 0
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCreateNextSubcontract = this.handleCreateNextSubcontract.bind(this)
    this.handleResolveMainContract = this.handleResolveMainContract.bind(this)
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

  async handleCreateNextSubcontract(event) {
    const account = await this.getAccount()
    const address = this.state.mainContractAddress.trim()
    const mainContract = await this.affiliateContract.at(address)
    mainContract.createNextSubContract({from: account, value: this.state.txValue}).then(function(result) {
      console.log(result)
    }).catch(function(err) {
      alert("ERROR! " + err.message);
    })
  }

  async handleResolveMainContract(event) {
    const account = await this.getAccount()
    const mainContract = this.affiliateContract.at(this.state.mainContractAddress.trim())
    mainContract.sellerResolve({from: account}).then(function(result) {
      console.log(result)
    }).catch(function(err) {
      alert("ERROR! " + err.message);
    })
  }

  render() {
    return(<React.Fragment>
      <Form id="inputForm">
        <h2>Perform owner actions</h2>
        <FormGroup>
          <Label for="mainContractAddress">Main contract address</Label>
          <Input
            type="text"
            name = "mainContractAddress"
            defaultValue={this.state.mainContractAddress}
            onChange={this.handleInputChange}
            id="mainContractAddress" 
          />
        </FormGroup>
        <Button color="primary" form='inputForm' onClick={ this.handleResolveMainContract }>Resolve main contract</Button>
        <FormGroup>
          <Label for="txValue">Transaction value (for create next subcontract)</Label>
          <Input
            type="text"
            name = "txValue"
            defaultValue={this.state.txValue}
            onChange={this.handleInputChange}
            id="txValue" 
          />
        </FormGroup>
        <Button color="primary" form='inputForm' onClick={ this.handleCreateNextSubcontract }>Create next subcontract</Button>
      </Form>
    </React.Fragment>)
  }
}

export default OwnerActionsForm
