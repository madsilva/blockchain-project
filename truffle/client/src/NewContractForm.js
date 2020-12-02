import React from 'react';
import {Form, FormGroup, Input, FormText, Button,InputGroup,InputGroupText,InputGroupAddon,Label} from 'reactstrap';
var contract = require("@truffle/contract");

const AffiliateContractJSON = require('./contracts/AffiliateContract.json')

class NewContractForm extends React.Component {
  constructor(props) {
    super(props);
    this.web3 = props.web3
    this.state = {
      //total funds for full agreement
      totalFunds: 0,
      //funds staked per SC
      SCfunds: 0,
      //length of period after main contract generated during which sales are accumulated
      totalDuration: 14,
      //number of subcontracts (minimum:3)
      nSubcontracts: 3,
      //Affilate wallet address
      affWallet: ' ',
      //length of seller grace period after each SC period, hours
      SGPlen: 1,
      //length of each subcontract in days
      SClen: 7,
      //comission rate, %
      rate: 5,
      //Incentive fee amount
      IF: 3,
      // Oracle address
      oracleAddress: ' '
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
      <h2>Create a new affiliate contract</h2>
      <h3>The current account in Metamask will be the owner of this contract.</h3>
      <FormGroup>
        <Label for="affWallet">Affiliate's Ethereum Wallet Address</Label>
        <Input
          type="text"
          name = "affWallet"
          defaultValue={this.state.affWallet}
          onChange={this.handleInputChange}
          id="affWallet"
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="affWallet">Oracle Address</Label>
        <Input
          type="text"
          name = "oracleAddress"
          defaultValue={this.state.oracleAddress}
          onChange={this.handleInputChange}
          id="oracleAddress"
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="totalFunds">Maximum Potential Earnings (eth)</Label>
        <Input
          type="number"
          name = "totalFunds"
          defaultValue={this.state.totalFunds}
          onChange={this.handleInputChange}
          id="totalFunds"
          min={0} 
          max={100}
          step={.1}
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="nSubcontracts">Number of Subcontracts</Label>
        <Input
          type="number"
          name = "nSubcontracts"
          defaultValue={this.state.nSubcontracts}
          onChange={this.handleInputChange}
          id="nSubcontracts"
          min={3} 
          max={100}
          step={1}
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="totalDuration">Incentive Fee amount (eth)</Label>
        <Input
          type="number"
          name = "IF"
          defaultValue={this.state.IF}
          onChange={this.handleInputChange}
          id="IF"
          min={0} 
          max={100}
          step={1}
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="rate">Commission Rate</Label>
        <Input
          type="number"
          name = "rate"
          defaultValue={this.state.rate}
          onChange={this.handleInputChange}
          id="rate"
          min={0} 
          max={100}
          step={.5}
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="SGPlen">Seller Grace Period Length (hours)</Label>
        <Input
          type="number"
          name = "SGPlen"
          defaultValue={this.state.SGPlen}
          onChange={this.handleInputChange}
          id="SGPlen"
          min={1} 
          max={24}
          step={1}
          //placeholder="buyerId" 
        />
      </FormGroup>
      <FormGroup>
        <Label for="SClen">Subcontract duration (days)</Label>
        <Input
          type="number"
          name = "SClen"
          defaultValue={this.state.SClen}
          onChange={this.handleInputChange}
          id="SClen"
          min={0} 
          max={30}
          step={1}
          //placeholder="buyerId" 
        />
      </FormGroup>
      <Button color="primary" type='submit' form='inputForm'>Submit</Button>
    </Form>
    </React.Fragment>)
  }
}

export default NewContractForm;
