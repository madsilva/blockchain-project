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

  printErrorMessage(error) {
    if (error.message.startsWith("Internal JSON-RPC error.")) {
      const message = JSON.parse(error.message.replace("Internal JSON-RPC error.", ""))
      console.log("Internal JSON-RPC error: " + message.message)
    } else {
      console.log(error)
    }
  }

  async handleMainContractInfo(event) {
    try {
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const subcontractsSoFar = await mainContract.subcontractsSoFar.call()
      const mainContractExpiration = await mainContract.contractExpiration.call()
      const subcontractStake = await mainContract.subcontractStake.call()
      const currentSubcontract = await mainContract.getCurrentSubcontract.call()
      console.log("subcontractsSoFar: " + subcontractsSoFar)
      console.log("mainContractExpiration: " + new Date(mainContractExpiration * 1000).toLocaleString("en-US"))
      console.log("subcontractStake: " + this.web3.utils.fromWei(subcontractStake))
      console.log("currentSubcontract: " + currentSubcontract)
    } catch(err) {
      console.log(err)
    }
  }

  async handleMainContractParams(event) {
    try {
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const owner = await mainContract.owner.call()
      const affiliate = await mainContract.affiliate.call()
      const totalSubcontracts = await mainContract.totalSubcontracts.call()
      const subcontractDuration = await mainContract.subcontractDuration.call()
      const gracePeriodDuration = await mainContract.gracePeriodDuration.call()
      const incentiveFee = await mainContract.incentiveFee.call()
      const affiliatePercentage = await mainContract.affiliatePercentage.call()
      const oracle = await mainContract.oracle.call()
      console.log("owner: " + owner)
      console.log("affiliate: " + affiliate)
      console.log("totalSubcontracts: " + totalSubcontracts)
      console.log("subcontractDuration: " + subcontractDuration)
      console.log("gracePeriodDuration: " + gracePeriodDuration)
      console.log("incentiveFee: " + this.web3.utils.fromWei(incentiveFee))
      console.log("affiliatePercentage: " + affiliatePercentage + "%")
      console.log("oracle: " + oracle)
    } catch(err) {
      console.log(err)
    } 
  }

  async handleSubcontractIndex(event) {
    try {
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const subcontractsSoFar = await mainContract.subcontractsSoFar.call()
      if (this.state.subcontractIndex >= subcontractsSoFar) {
        console.log("Error: index out of range of existing subcontracts.")
      } else {
        const result = await mainContract.subcontracts.call(this.state.subcontractIndex)
        console.log("Subcontract at given index: " + result)
      }
    } catch(err) {
      this.printErrorMessage(err)
    }
  }

  async handleSubcontractInfo(event) {
    try {
      const subcontract = await this.affiliateSubcontract.at(this.state.subcontractAddress.trim())
      const mainContractAddress = await subcontract.owner.call()
      const subcontractExpiration = await subcontract.expiration.call()
      const sellerGracePeriodEnd = await subcontract.sellerGracePeriodEnd.call()
      const indexNumber = await subcontract.indexNumber.call()
      const nextSubcontractAddress = await subcontract.nextSubcontract.call()
      const affiliateResolved = await subcontract.affiliateResolved.call()
      const gracePeriodExpired = await subcontract.gracePeriodExpired.call()
      const currentTotal = await subcontract.currentTotal.call()
      const totalLastUpdated = await subcontract.totalLastUpdated.call()
      const startTime = await subcontract.startTime.call()
      console.log("mainContractAddress: " + mainContractAddress)
      console.log("subcontractExpiration: " + new Date(subcontractExpiration * 1000).toLocaleString("en-US"))
      console.log("sellerGracePeriodEnd: " + new Date(sellerGracePeriodEnd * 1000).toLocaleString("en-US"))
      console.log("indexNumber: " + indexNumber)
      console.log("nextSubcontractAddress: " + nextSubcontractAddress)
      console.log("affiliateResolved: " + affiliateResolved)
      console.log("gracePeriodExpired: " + gracePeriodExpired)
      console.log("currentTotal: " + currentTotal)
      console.log("totalLastUpdated: " + new Date(totalLastUpdated * 1000).toLocaleString("en-US"))
      console.log("startTime: " + new Date(startTime * 1000).toLocaleString("en-US"))
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
