import React from 'react';
import {Form, FormGroup, Input, FormText, Button,InputGroup,InputGroupText,InputGroupAddon,Label} from 'reactstrap';
var contract = require("@truffle/contract");

const AffiliateContractJSON = require('./contracts/AffiliateContract.json')

class ContractInfoForm extends React.Component {
  constructor(props) {
    super(props);
    this.web3 = props.web3
    this.state = {
      // main contract address
      mainContractAddress: ' '
    };
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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

  async handleSubmit(event) {
    // all form input values need to be validated by this point
    const accounts = await this.web3.eth.getAccounts()
    var AffiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode});
    AffiliateContract.setProvider(this.web3.currentProvider);
    //var newContract = await AffiliateContract.new()
  }

  render() {
    return(<React.Fragment>
    <Form id="inputForm" onSubmit={ this.handleSubmit }>
      <h2>Get info about existing contracts</h2>
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
      
      <Button color="primary" type='submit' form='inputForm'>Submit</Button>
    </Form>
    </React.Fragment>)
  }
}

export default ContractInfoForm;
