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
    this.handleResolveSubcontract = this.handleResolveSubcontract.bind(this)
  }

  handleInputChange(event) {
    const {name, value} = event.target;
    this.state[name]=value
    this.setState(this.state)
  }

  async handleResolveSubcontract(event) {
    console.log("resolve sc")
    const accounts = await this.web3.eth.getAccounts()
    var address = this.state.subcontractAddress.trim()
    var subcontract = await this.affiliateSubcontract.at(address)
    subcontract.affiliateResolve({from: accounts[0]}).then(function(result) {
      console.log("did it")
      console.log(result)
    }).catch(function(err) {
      alert("ERROR! " + err.message);
    })
  }

  handleUpdateTotal(event) {
    console.log("update total!")
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
          //placeholder="buyerId" 
        />
      </FormGroup>
      
      <Button color="primary" form='inputForm' onClick={ this.handleUpdateTotal }>Update total</Button>
      <Button color="primary" form='inputForm' onClick={ this.handleResolveSubcontract }>Resolve subcontract</Button>

    </Form>
    </React.Fragment>)
  }
}

export default AffiliateActionsForm;
