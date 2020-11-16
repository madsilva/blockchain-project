import EmbarkJS from 'Embark/EmbarkJS';
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

  checkEnter(e, func) {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    func.apply(this, [e]);
  }

  handleFileUpload(e) {
    this.setState({fileToUpload: [e.target]});
  }

  addToLog(txt) {
    this.state.logs.push(txt);
    this.setState({logs: this.state.logs});
  }

  setText(e) {
    e.preventDefault();

    EmbarkJS.Storage.saveText(this.state.textToSave)
      .then((hash) => {
        this.setState({
          generatedHash: hash,
          loadText: hash,
          storageError: ''
        });
        this.addToLog("EmbarkJS.Storage.saveText('" + this.state.textToSave + "').then(function(hash) { })");
      })
      .catch((err) => {
        if (err) {
          this.setState({storageError: err.message});
          console.log("Storage saveText Error => " + err.message);
        }
      });
  }

  loadHash(e) {
    e.preventDefault();

    EmbarkJS.Storage.get(this.state.loadText)
      .then((content) => {
        this.setState({storedText: content, storageError: ''});
        this.addToLog("EmbarkJS.Storage.get('" + this.state.loadText + "').then(function(content) { })");
      })
      .catch((err) => {
        if (err) {
          this.setState({storageError: err.message});
          console.log("Storage get Error => " + err.message);
        }
      });
  }

  uploadFile(e) {
    e.preventDefault();

    EmbarkJS.Storage.uploadFile(this.state.fileToUpload)
      .then((hash) => {
        this.setState({
          fileHash: hash,
          imageToDownload: hash,
          storageError: ''
        });
        this.addToLog("EmbarkJS.Storage.uploadFile(this.state.fileToUpload).then(function(hash) { })");
      })
      .catch((err) => {
        if (err) {
          this.setState({storageError: err.message});
          console.log("Storage uploadFile Error => " + err.message);
        }
      });
  }

  loadFile(_e) {
    let _url = EmbarkJS.Storage.getUrl(this.state.imageToDownload);
    this.setState({url: _url});
    this.addToLog("EmbarkJS.Storage.getUrl('" + this.state.imageToDownload + "')");
  }

  ipnsRegister(e) {
    e.preventDefault();
    this.setState({ registering: true, responseRegister: false });
    this.addToLog("EmbarkJS.Storage.register(this.state.ipfsHash).then(function(hash) { })");
    EmbarkJS.Storage.register(this.state.valueRegister, (err, name) => {
      let responseRegister;
      let isRegisterError = false;
      if (err) {
        isRegisterError = true;
        responseRegister = "Name Register Error: " + (err.message || err);
      } else {
        responseRegister = name;
      }

      this.setState({
        registering: false,
        responseRegister,
        isRegisterError
      });
    });
  }

  ipnsResolve(e) {
    e.preventDefault();
    this.setState({ resolving: true, responseResolver: false });
    this.addToLog("EmbarkJS.Storage.resolve(this.state.ipnsName, function(err, path) { })");
    EmbarkJS.Storage.resolve(this.state.valueResolver, (err, path) => {
      let responseResolver;
      let isResolverError = false;
      if (err) {
        isResolverError = true;
        responseResolver = "Name Resolve Error: " + (err.message || err);
      } else {
        responseResolver = path;
      }

      this.setState({
        resolving: false,
        responseResolver,
        isResolverError
      });
    });
  }

  isIpfs(){
    return EmbarkJS.Storage.currentProviderName === 'ipfs';
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
