import React from 'react'
import {Form, FormGroup, Input, Button, Label} from 'reactstrap'

var contract = require("@truffle/contract")
const AffiliateSubcontractJSON = require('./contracts/AffiliateSubcontract.json')

class AffiliateActionsForm extends React.Component {
  constructor(props) {
    super(props)
    this.web3 = props.web3
    this.affiliateSubcontract = contract({abi: AffiliateSubcontractJSON.abi})
    this.affiliateSubcontract.setProvider(this.web3.currentProvider)
    this.state = {
      subcontractAddress: ''
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleUpdateTotal = this.handleUpdateTotal.bind(this)
    this.handleResolveSubcontract = this.handleResolveSubcontract.bind(this)
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

  async handleUpdateTotal(event) {
    const account = await this.getAccount()
    const subcontract = await this.affiliateSubcontract.at(this.state.subcontractAddress.trim())
    subcontract.updateCurrentTotal({from: account}).then(function(result) {
      console.log(result)
    }).catch(function(err) {
      alert("ERROR! " + err.message)
    })
  }

  async handleResolveSubcontract(event) {
    const account = await this.getAccount()
    const subcontract = await this.affiliateSubcontract.at(this.state.subcontractAddress.trim())
    subcontract.affiliateResolve({from: account}).then(function(result) {
      console.log(result)
    }).catch(function(err) {
      alert("ERROR! " + err.message)
    })
  }

  render() {
    return(<React.Fragment>
    <Form id="inputForm">
      <h2>Perform affiliate actions</h2>
      <FormGroup>
        <Label for="subcontractAddress">Subcontract address</Label>
        <Input
          type="text"
          name = "subcontractAddress"
          defaultValue={this.state.subcontractAddress}
          onChange={this.handleInputChange}
          id="subcontractAddress"
        />
      </FormGroup>
      <Button color="primary" form='inputForm' onClick={ this.handleUpdateTotal }>Update total</Button>
      <Button color="primary" form='inputForm' onClick={ this.handleResolveSubcontract }>Resolve subcontract</Button>
    </Form>
    </React.Fragment>)
  }
}

export default AffiliateActionsForm
