import React from 'react'
import {Form, FormGroup, Input, Button, Label, Table} from 'reactstrap'

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
      subcontractsSoFar: '',
      mainContractExpiration: '',
      subcontractStake: '',
      currentSubcontract: '',
      owner: '',
      affiliate: '',
      totalSubcontracts: '',
      subcontractDuration: '',
      gracePeriodDuration: '',
      incentiveFee: '',
      affiliatePercentage: '',
      oracle: '',
      subcontractIndex: 0,
      subcontractAtIndex: '',
      subcontractAddress: '',
      subcontractMainContractAddress: '',
      subcontractExpiration: '',
      sellerGracePeriodEnd: '',
      indexNumber: '',
      nextSubcontractAddress: '',
      affiliateResolved: '',
      gracePeriodExpired: '',
      currentTotal: '',
      totalLastUpdated: '',
      startTime: '',
      payout: ''
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleMainContractInfo = this.handleMainContractInfo.bind(this)
    this.handleMainContractParams = this.handleMainContractParams.bind(this)
    this.handleSubcontractIndex = this.handleSubcontractIndex.bind(this)
    this.handleSubcontractInfo = this.handleSubcontractInfo.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target
    this.setState({[name]: value})
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
      this.setState({
        subcontractsSoFar: String(subcontractsSoFar),
        mainContractExpiration: new Date(mainContractExpiration * 1000).toLocaleString("en-US"),
        subcontractStake: String(this.web3.utils.fromWei(subcontractStake)),
        currentSubcontract: String(currentSubcontract)
      })
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
      const affiliatePercentage = await mainContract.humanReadableAffiliatePercentage.call()
      const oracle = await mainContract.oracle.call()
      this.setState({
        owner: String(owner),
        affiliate: String(affiliate),
        totalSubcontracts: String(totalSubcontracts),
        subcontractDuration: String(Number(subcontractDuration) / 60),
        gracePeriodDuration: String(Number(gracePeriodDuration) / 60),
        incentiveFee: String(this.web3.utils.fromWei(incentiveFee)),
        affiliatePercentage: String(affiliatePercentage),
        oracle: String(oracle)
      })
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
        this.setState({subcontractAtIndex: String(result)})
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
      const payout = await subcontract.payout.call()
      this.setState({
        subcontractMainContractAddress: String(mainContractAddress),
        subcontractExpiration: new Date(subcontractExpiration * 1000).toLocaleString("en-US"),
        sellerGracePeriodEnd: new Date(sellerGracePeriodEnd * 1000).toLocaleString("en-US"),
        indexNumber: String(indexNumber),
        nextSubcontractAddress: String(nextSubcontractAddress),
        affiliateResolved: String(affiliateResolved),
        gracePeriodExpired: String(gracePeriodExpired),
        currentTotal: String(currentTotal),
        totalLastUpdated: new Date(totalLastUpdated * 1000).toLocaleString("en-US"),
        startTime: new Date(startTime * 1000).toLocaleString("en-US"),
        payout: String(payout)
      })
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
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>Subcontracts so far: { this.state.subcontractsSoFar }</td>
                <td>Main contract expiration: { this.state.mainContractExpiration }</td>
              </tr>
              <tr>
                <td>Subcontract stake: { this.state.subcontractStake } ETH</td>
                <td>Current subcontract: { this.state.currentSubcontract }</td>
              </tr>
            </tbody>
          </Table>
          <Button color="primary" form='inputForm' onClick={ this.handleMainContractParams }>Get main contract parameters</Button>
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>Owner: { this.state.owner }</td>
                <td>Affiliate: { this.state.affiliate }</td>
                <td>Total subcontracts: { this.state.totalSubcontracts }</td>
                <td>Subcontract duration: { this.state.subcontractDuration } minutes</td>
              </tr>
              <tr>
                <td>Grace period duration: { this.state.gracePeriodDuration } minutes</td>
                <td>Incentive fee: { this.state.incentiveFee } ETH</td>
                <td>Affiliate Percentage: { this.state.affiliatePercentage }</td>
                <td>Oracle: { this.state.oracle }</td>
              </tr>
            </tbody>
          </Table>
          <Label for="subcontractIndex">Subcontract index</Label>
          <Input
            type="text"
            name = "subcontractIndex"
            defaultValue={this.state.subcontractIndex}
            onChange={this.handleInputChange}
            id="subcontractIndex"
          />
          <Button color="primary" form='inputForm' onClick={ this.handleSubcontractIndex }>Get subcontract address</Button>
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>Subcontract at index { this.state.subcontractIndex }: { this.state.subcontractAtIndex }</td>
              </tr>
            </tbody>
          </Table>
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
          <Table bordered size="sm">
            <tbody>
              <tr>
                <td>Main contract address: { this.state.subcontractMainContractAddress }</td>
                <td>Subcontract expiration: { this.state.subcontractExpiration }</td>
                <td>Seller grace period end: { this.state.sellerGracePeriodEnd }</td>
                <td>Index number: { this.state.indexNumber }</td>
              </tr>
              <tr>
                <td>Next subcontract: { this.state.nextSubcontractAddress }</td>
                <td>Affiliate resolved: { this.state.affiliateResolved }</td>
                <td>Grace period expired: { this.state.gracePeriodExpired }</td>
                <td>Current total: { this.state.currentTotal }</td>
              </tr>
              <tr>
                <td>Total last updated: { this.state.totalLastUpdated }</td>
                <td>Start time: { this.state.startTime }</td>
                <td>Payout: { this.state.payout }</td>
              </tr>
            </tbody>
          </Table>
        </FormGroup> 
      </Form>
    </React.Fragment>)
  }
}

export default ContractInfoForm
