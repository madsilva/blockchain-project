import React from 'react'
import {Form, FormGroup, Input, Button, Label, Alert} from 'reactstrap'

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
      txValue: 0,
      contractErrorMessage: ''
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleCreateNextSubcontract = this.handleCreateNextSubcontract.bind(this)
    this.handleResolveMainContract = this.handleResolveMainContract.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target
    this.setState({[name]: value, contractErrorMessage: ''})
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
      this.setState({contractErrorMessage: "Contract error: " + message.message})
    } else {
      console.log(error)
      this.setState({contractErrorMessage: "Error: " + error.message})
    }
  }
  
  async handleCreateNextSubcontract(event) {
    try {
      this.setState({contractErrorMessage: ''})
      const account = await this.getAccount()
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      await mainContract.createNextSubContract.estimateGas({from: account, value: this.web3.utils.toWei(String(this.state.txValue))})
      const result = await mainContract.createNextSubContract({from: account, value: this.web3.utils.toWei(String(this.state.txValue))})
      console.log(result)
    } catch(err) {
      this.printErrorMessage(err)
    }
  }

  async handleResolveMainContract(event) {
    try {
      this.setState({contractErrorMessage: ''})
      const account = await this.getAccount()
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      await mainContract.sellerResolve.estimateGas({from: account})
      const result = await mainContract.sellerResolve({from: account})
      console.log(result)
    } catch(err) {
      this.printErrorMessage(err)
    }
  }

  render() {
    return(<React.Fragment>
      <Form id="inputForm">
        <h4>Perform owner actions</h4>
        <h5>Must be logged in as owner.</h5>
        <FormGroup>
          <Label for="mainContractAddress">Main contract address</Label>
          <Input
            type="text"
            name = "mainContractAddress"
            defaultValue={this.state.mainContractAddress}
            onChange={this.handleInputChange}
            id="mainContractAddress" 
          />
          <Button color="primary" form='inputForm' onClick={ this.handleResolveMainContract }>Resolve main contract</Button>
        </FormGroup>
        <FormGroup>
          <Label for="txValue">Transaction value (for create next subcontract), in Ether</Label>
          <Input
            type="text"
            name = "txValue"
            defaultValue={this.state.txValue}
            onChange={this.handleInputChange}
            id="txValue" 
          />
          <Button color="primary" form='inputForm' onClick={ this.handleCreateNextSubcontract }>Create next subcontract</Button>
        </FormGroup>
        <FormGroup>
          <Alert color="warning">
            { this.state.contractErrorMessage }
          </Alert>
        </FormGroup>
      </Form>
    </React.Fragment>)
  }
}

export default OwnerActionsForm
