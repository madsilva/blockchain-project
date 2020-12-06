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
      mainContractAddress: '',
      subcontractAddress: '',
      subcontractIndex: 0
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleMainContractInfo = this.handleMainContractInfo.bind(this)
    this.handleMainContractParams = this.handleMainContractParams.bind(this)
    this.handleSubcontractIndex = this.handleSubcontractIndex.bind(this)
    this.handleSubcontractInfo = this.handleSubcontractInfo.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target
    this.state[name] = value
    this.setState(this.state)
  }

  async handleMainContractInfo(event) {
    try {
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const affiliate = await mainContract.affiliate.call()
      console.log(affiliate)
      const currentSubcontract = await mainContract.getCurrentSubcontract.call()
      console.log(currentSubcontract)
    } catch(err) {
      console.log(err)
    }
  }

  async handleMainContractParams(event) {
    try {
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const totalSubcontracts = await mainContract.totalSubcontracts.call()
      console.log(totalSubcontracts)
    } catch(err) {
      console.log(err)
    } 
  }

  async handleSubcontractIndex(event) {
    try {
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const result = await mainContract.subcontracts.call(this.state.subcontractIndex)
      console.log(result)
    } catch(err) {
      console.log(err)
    }
  }

  async handleSubcontractInfo(event) {
    try {
      const subcontract = await this.affiliateSubcontract.at(this.state.subcontractAddress.trim())
      const expiration = await subcontract.expiration.call()
      console.log(expiration)
      const nextSubcontract = await subcontract.nextSubcontract.call()
      console.log(nextSubcontract)
    } catch(err) {
      console.log(err)
    }
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

export default ContractInfoForm
