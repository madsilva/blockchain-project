import React from 'react';
import {Form, FormGroup, Input, FormText, Button,InputGroup,InputGroupText,InputGroupAddon,Label} from 'reactstrap';
var contract = require("@truffle/contract");

const AffiliateContractJSON = require('./contracts/AffiliateContract.json')

class OwnerActionsForm extends React.Component {
  constructor(props) {
    super(props);
    this.web3 = props.web3
    this.state = {
      // main contract address
      mainContractAddress: ' '
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

  async handleCreateNextSubcontract(event) {
    console.log("create next sc")
  }

  handleResolveMainContract(event) {
    console.log("resolve main contract")
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
          //placeholder="buyerId" 
        />
      </FormGroup>
      
      <Button color="primary" form='inputForm' onClick={ this.handleCreateNextSubcontract }>Create next subcontract</Button>
      <Button color="primary" form='inputForm' onClick={ this.handleResolveMainContract }>Resolve main contract</Button>

    </Form>
    </React.Fragment>)
  }
}

export default OwnerActionsForm;
