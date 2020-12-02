import React from 'react';
import {Form, FormGroup, Input, FormText, Button,InputGroup,InputGroupText,InputGroupAddon,Label} from 'reactstrap';
var contract = require("@truffle/contract");

const AffiliateContractJSON = require('./contracts/AffiliateContract.json')

class AffiliateActionsForm extends React.Component {
  constructor(props) {
    super(props);
    this.web3 = props.web3
    this.state = {
      // main contract address
      subcontractAddress: ' '
    };
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleChange(e, name) {
    this.state[name] = e.target.value;
    this.setState(this.state);
    
  }

  handleInputChange(event) {
    const {name, value} = event.target;
    console.log(name);
    console.log(value);
    this.state[name]=value
    this.setState(this.state)
    //this.setState({[name]: value}), () => (console.log(this.state));
    //if((name=='totalFunds') || (name=='nSubcontracts')){
    //  this.state[SCfunds] = this.state[totalFunds]/this.state[nSubcontracts];
 //} 
    console.log(this.state)
  }

  async handleResolveSubcontract(event) {
    console.log("resolve sc")
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
