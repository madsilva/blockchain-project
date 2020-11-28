import React, {Fragment} from 'react';
import {Alert, Form, FormGroup, Input, FormText, Button,InputGroup,InputGroupText,InputGroupAddon,Label} from 'reactstrap';

class MainForm extends React.Component {
  constructor(props) {
    super(props);

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
      //length of affilate grace period after last SC period, days
      AGPlen: 7,
      //comission rate, %
      rate: 5,
      //Incentive fee amount
      IF: 3
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

  render() {
    return(<React.Fragment>
    <Form id="inputForm">
      <h3>Apply for a contract</h3>
        <FormGroup>
        <Label for="affWallet">Ethereum Wallet Address</Label>
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
          min={0} 
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
        <Label for="AGPlen">Affiliate Grace Period Length (days)</Label>
        <Input
          type="number"
          name = "AGPlen"
          defaultValue={this.state.AGPlen}
          onChange={this.handleInputChange}
          id="AGPlen"
          min={3} 
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

export default MainForm;
