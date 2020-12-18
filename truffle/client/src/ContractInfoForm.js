import React from 'react'
import {Form, FormGroup, Input, Button, Label, Table, Alert, Row, Col} from 'reactstrap'

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
      contractErrorMessage: '',
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
    this.handleSubcontractIndex = this.handleSubcontractIndex.bind(this)
    this.handleSubcontractInfo = this.handleSubcontractInfo.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target
    this.setState({[name]: value, contractErrorMessage: ''})
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

  async handleMainContractInfo(event) {
    try {
      this.setState({contractErrorMessage: ''})
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const subcontractsSoFar = await mainContract.subcontractsSoFar.call()
      const mainContractExpiration = await mainContract.contractExpiration.call()
      const subcontractStake = await mainContract.subcontractStake.call()
      const currentSubcontract = await mainContract.getCurrentSubcontract.call()
      const owner = await mainContract.owner.call()
      const affiliate = await mainContract.affiliate.call()
      const totalSubcontracts = await mainContract.totalSubcontracts.call()
      const subcontractDuration = await mainContract.subcontractDuration.call()
      const gracePeriodDuration = await mainContract.gracePeriodDuration.call()
      const incentiveFee = await mainContract.incentiveFee.call()
      const affiliatePercentage = await mainContract.humanReadableAffiliatePercentage.call()
      const oracle = await mainContract.oracle.call()
      this.setState({
        subcontractsSoFar: String(subcontractsSoFar),
        mainContractExpiration: new Date(mainContractExpiration * 1000).toLocaleString("en-US"),
        subcontractStake: String(this.web3.utils.fromWei(subcontractStake)),
        currentSubcontract: String(currentSubcontract),
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
      this.printErrorMessage(err)
    }
  }

  async handleSubcontractIndex(event) {
    try {
      this.setState({contractErrorMessage: ''})
      const mainContract = await this.affiliateContract.at(this.state.mainContractAddress.trim())
      const subcontractsSoFar = await mainContract.subcontractsSoFar.call()
      if (this.state.subcontractIndex >= subcontractsSoFar) {
        console.log("Error: index out of range of existing subcontracts.")
        this.setState({contractErrorMessage: "Error: index out of range of existing subcontracts."})
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
      this.setState({contractErrorMessage: ''})
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
      this.printErrorMessage(err)
    }
  }

  render() {
    return(<React.Fragment>
      <Form id="inputForm">
        <h4>Get info about existing contracts</h4>
        <h5>You can do this while using any account in Metamask.</h5>
        { this.state.contractErrorMessage !== '' &&
          <FormGroup>
            <Alert color="danger">
              { this.state.contractErrorMessage }
            </Alert>
          </FormGroup>
        }
        <FormGroup>
          <Label for="mainContractAddress">Main contract address</Label>
          <Row>
            <Col>
            <Input
              type="text"
              name = "mainContractAddress"
              defaultValue={this.state.mainContractAddress}
              onChange={this.handleInputChange}
              id="mainContractAddress"
            />
            </Col>
            <Col sm={3}>
            <Button color="primary" form='inputForm' onClick={ this.handleMainContractInfo }>Get main contract info</Button>
            </Col>
          </Row>
        </FormGroup>
        <Table bordered striped size="sm">
          <tbody>
            <tr>
              <th>Main contract info</th>
            </tr>
            <tr>
              <td>Main contract expiration: <span className="highlight">{ this.state.mainContractExpiration }</span></td>
              <td>Subcontracts so far: <span className="highlight">{ this.state.subcontractsSoFar }</span></td>
            </tr>
            <tr>
              <td>Current subcontract: <span className="highlight">{ this.state.currentSubcontract }</span></td>
              <td>Subcontract stake: <span className="highlight">{ this.state.subcontractStake } ETH</span></td>
            </tr>
          </tbody>
        </Table>
        <Table bordered striped size="sm">
          <tbody>
            <tr>
              <th>Main contract parameters</th>
            </tr>
            <tr>
              <td>Owner: <span className="highlight">{ this.state.owner }</span></td>
              <td>Affiliate: <span className="highlight">{ this.state.affiliate }</span></td>
              <td>Oracle: <span className="highlight">{ this.state.oracle }</span></td>
            </tr>
            <tr>
              <td>Total subcontracts: <span className="highlight">{ this.state.totalSubcontracts }</span></td>
              <td>Incentive fee: <span className="highlight">{ this.state.incentiveFee } ETH</span></td>
              <td>Affiliate Percentage: <span className="highlight">{ this.state.affiliatePercentage }%</span></td>
            </tr>
            <tr>
              <td>Subcontract duration: <span className="highlight">{ this.state.subcontractDuration } minutes</span></td>
              <td>Grace period duration: <span className="highlight">{ this.state.gracePeriodDuration } minutes</span></td>
            </tr>
          </tbody>
        </Table>
        <FormGroup>
          <Label for="subcontractIndex">Subcontract index (requires main contract address)</Label>
          <Row>
            <Col>
            <Input
              type="text"
              name = "subcontractIndex"
              defaultValue={this.state.subcontractIndex}
              onChange={this.handleInputChange}
              id="subcontractIndex"
            />
            </Col>
            <Col sm={3}>
            <Button color="primary" form='inputForm' onClick={ this.handleSubcontractIndex }>Get subcontract address</Button>
            </Col>
          </Row>
        </FormGroup>
        <Table bordered size="sm">
          <tbody>
            <tr>
              <td>Subcontract at given index: <span className="highlight">{ this.state.subcontractAtIndex }</span></td>
            </tr>
          </tbody>
        </Table>
        <FormGroup>
          <Label for="subcontractAddress">Subcontract address</Label>
          <Row>
            <Col>
            <Input
              type="text"
              name = "subcontractAddress"
              defaultValue={this.state.subcontractAddress}
              onChange={this.handleInputChange}
              id="subcontractAddress"
            />
            </Col>
            <Col sm={3}>
            <Button color="primary" form='inputForm' onClick={ this.handleSubcontractInfo }>Get subcontract info</Button>
            </Col>
          </Row>
        </FormGroup>
        <Table bordered striped size="sm">
          <tbody>
            <tr>
              <th>Subcontract info</th>
            </tr>
            <tr>
              <td>Main contract address: <span className="highlight">{ this.state.subcontractMainContractAddress }</span></td>
              <td>Next subcontract: <span className="highlight">{ this.state.nextSubcontractAddress }</span></td>
              <td>Index number: <span className="highlight">{ this.state.indexNumber }</span></td>
            </tr>
            <tr>
              <td>Subcontract expiration: <span className="highlight">{ this.state.subcontractExpiration }</span></td>
              <td>Seller grace period end: <span className="highlight">{ this.state.sellerGracePeriodEnd }</span></td>
              <td>Affiliate resolved: <span className="highlight">{ this.state.affiliateResolved }</span></td>
              <td>Grace period expired: <span className="highlight">{ this.state.gracePeriodExpired }</span></td>
            </tr>
            <tr>
              <td>Total last updated: <span className="highlight">{ this.state.totalLastUpdated }</span></td>
              <td>Start time: <span className="highlight">{ this.state.startTime }</span></td>
              <td>Current total: <span className="highlight">{ this.state.currentTotal }</span></td>
              <td>Payout: <span className="highlight">{ this.state.payout }</span></td>
            </tr>
          </tbody>
        </Table> 
      </Form>
    </React.Fragment>)
  }
}

export default ContractInfoForm
