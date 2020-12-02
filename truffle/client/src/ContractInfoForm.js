import React from 'react'
import {Form, FormGroup, Input, Button, Label} from 'reactstrap'

const contract = require("@truffle/contract")
const AffiliateContractJSON = require('./contracts/AffiliateContract.json')
const AffiliateSubcontractJSON = require('./contracts/AffiliateSubcontract.json')

class ContractInfoForm extends React.Component {
  constructor(props) {
    super(props)
    this.web3 = props.web3
    this.affiliateContract = contract({abi: AffiliateContractJSON.abi})
    this.affiliateSubcontract = contract({abi: AffiliateSubcontractJSON.abi})
    this.affiliateContract.setProvider(this.web3.currentProvider)
    this.affiliateSubcontract.setProvider(this.web3.currentProvider)
    this.state = {
      mainContractAddress: ' ',
      subcontractAddress: ' ',
      subcontractIndex: 0
    }
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target
    this.state[name] = value
    this.setState(this.state)
  }

  handleMainContractInfo(event) {

  }

  handleMainContractParams(event) {

  }

  handleSubcontractIndex(event) {

  }

  handleSubcontractInfo(event) {

  }

  render() {
    return(<React.Fragment>
      <Form id="inputForm">
        <h2>Get info about existing contracts or subcontracts</h2>
        <h3>You can do this while using any account in Metamask</h3>
        <FormGroup>
          <Label for="mainContractAddress">Main contract address</Label>
          <Input
            type="text"
            name = "mainContractAddress"
            defaultValue={this.state.mainContractAddress}
            onChange={this.handleInputChange}
            id="mainContractAddress"
          />
          <Button color="primary" form='inputForm' onClick={ this.handleMainContractInfo }>Get main contract info</Button>
          <br />
          <Button color="primary" form='inputForm' onClick={ this.handleMainContractParams }>Get main contract parameters</Button>
          <br />
          <Label for="subcontractIndex">Subcontract index</Label>
          <Input
            type="text"
            name = "subcontractIndex"
            defaultValue={this.state.subcontractIndex}
            onChange={this.handleInputChange}
            id="subcontractIndex"
          />
          <Button color="primary" form='inputForm' onClick={ this.handleSubcontractIndex }>Get subcontract address</Button>
        </FormGroup>
        <FormGroup>
          <Label for="subcontractAddress">Subcontract address</Label>
          <Input
            type="text"
            name = "subcontractAddress"
            defaultValue={this.state.subcontractAddress}
            onChange={this.handleInputChange}
            id="subcontractAddress"
          />
          <Button color="primary" form='inputForm' onClick={ this.handleSubcontractInfo }>Get subcontract info</Button>
        </FormGroup> 
      </Form>
    </React.Fragment>)
  }
}

export default ContractInfoForm;
