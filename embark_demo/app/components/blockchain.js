import EmbarkJS from 'Embark/EmbarkJS';
import SimpleStorage from '../../embarkArtifacts/contracts/SimpleStorage';
import React from 'react';
import {Form, FormGroup, Input, HelpBlock, Button, FormText,Label, FormData} from 'reactstrap';

class Blockchain extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      valueSet: {
      buyerHandle: "",
      buyerId: "QmW1fE8BeHQGup7gaNLXx2gM1JP27fyxCaHZDoor5F5WGF",
      coinType: "USD",
      moderated: true,
      orderId: "QmfYUVq8puk64Vc7FjDv4dE7XHGotJtij9yF6jejLnmrjg",
      paymentCoin: "TLTC",
      read: false,
      shippingAddress: "1060 W Addison",
      shippingName: "Elwood Blues",
      slug: "eth-physical-order-testing-w-options",
      state: "AWAITING_FULFILLMENT",
      thumbnail: "QmbjyAxYee4y3443kAMLcmRVwggZsRDKiyXnXus1qdJJWz",
      timestamp: "2019-10-02T11:59:49+10:00",
      title: "ETH physical order testing w/ options",
      total: "3559244",
      unreadChatMessages: 0,
    },
      valueGet: {      
      buyerHandleGet: "",
      buyerIdGet: "",
      coinTypeGet: "",
      moderatedGet: "",
      orderIdGet: "",
      paymentCoinGet: "",
      readGet: "",
      shippingAddressGet: "",
      shippingNameGet: "",
      slugGet: "",
      stateGet: "",
      thumbnailGet: "",
      timestampGet: "",
      titleGet: "",
      totalGet: "",
      unreadChatMessagesGet: "",
    },
      logs: []
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    let newData = Object.assign({}, this.state.valueSet, {[name]:value});
    this.setState({
      valueSet: newData
    });
    this._addToLog(JSON.stringify(this.state.valueSet))

  }

  handleChange(e) {
    //this.state.valueSet = false
    this._addToLog("HandleChange")
    console.log("HandleChange")
    let inputForm = document.getElementById('inputForm');
    this._addToLog("HandleChange")
    console.log(JSON.stringify(inputForm))
    let data = new FormData(inputForm);
    console.log(data)


    this._addToLog("HandleChange")
    data.forEach((value, key) => {object[key] = value});
    this._addToLog(JSON.stringify(object));
    this._addToLog(e.target.value);
    this._addToLog(JSON.stringify(this.state.valueSet))
    this.setState({ valueSet: e.target.value });
  }

  checkEnter(e, func) {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    func.apply(this, [e]);
  }

  async setValue(e) {
    e.preventDefault();
    //await EmbarkJS.enableEthereum();
    var value = JSON.stringify(this.state.valueSet)

    SimpleStorage.methods.set(value).send({gas:900000});
    this._addToLog("setValue")
    this._addToLog("SimpleStorage.methods.set(value).send()");
    this._addToLog(value);
  }

  getValue(e) {
    e.preventDefault();
    //SimpleStorage.methods.get().call().then(_value => this._addToLog(_value));
    SimpleStorage.methods.get().call().then(_value => this.setState({ valueGet: JSON.parse(_value) }));
    this._addToLog("SimpleStorage.methods.get(console.log)");
  }

  
  _addToLog(txt) {
    this.state.logs.push(txt);
    this.setState({ logs: this.state.logs });
  }

  render() {
    return (<React.Fragment>
      <Form id="inputForm">
        <h3> Example purchase order</h3>
        <FormGroup>
          <Input
            type="text"
            name = "buyerId"
            defaultValue={this.state.buyerId}
            onChange={this.handleInputChange}
            placeholder="buyerId" />
          <Input
            type="text"
            name = "coinType"
            defaultValue={this.state.coinType}
            onChange={this.handleInputChange}
            placeholder="coinType"/>
          <Input
            type="text"
            name = "orderId"
            defaultValue={this.state.orderId}
            onChange={this.handleInputChange}
            placeholder="orderId"/>
          <Input
            type="text"
            name = "paymentCoin"
            defaultValue={this.state.paymentCoin}
            onChange={this.handleInputChange}
            placeholder="paymentCoin"/>
          <Input
            type="text"
            name = "shippingAddress"
            defaultValue={this.state.shippingAddress}
            onChange={this.handleInputChange}
            placeholder="shippingAddress"/>
          <Input
            type="text"
            name = "shippingName"
            defaultValue={this.state.shippingName}
            onChange={this.handleInputChange}
            placeholder="shippingName"/>
          <Input
            type="text"
            name = "slug"
            defaultValue={this.state.slug}
            onChange={this.handleInputChange}
            placeholder="slug"/>
          <Input
            type="text"
            name = "thumbnail"
            defaultValue={this.state.thumbnail}
            onChange={this.handleInputChange}
            placeholder="thumbnail"/>
          <Input
            type="text"
            name = "timestamp"
            defaultValue={this.state.timestamp}
            onChange={this.handleInputChange}
            placeholder="timestamp"/>
          <Input
            type="text"
            name = "title"
            defaultValue={this.state.title}
            onChange={this.handleInputChange}
            placeholder="title"/>          
          <Input
            type="text"
            name = "total"
            defaultValue={this.state.total}
            onChange={this.handleInputChange}
            placeholder="total"/>     

          <FormGroup tag="fieldset">
            <FormGroup check>
              <Label check>
              <Input type="radio" name="state" value="AWAITING_FULFILLMENT" onClick={this.handleInputChange} onChange={this.handleInputChange} checked={this.state.valueSet.state=="AWAITING_FULFILLMENT"}/>{' '}
              AWAITING_FULFILLMENT
              </Label>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input type="radio" name="state" value="COMPLETE" onClick={this.handleInputChange} onChange={this.handleInputChange} checked={this.state.valueSet.state=="COMPLETE"} />{' '}
              COMPLETE
            </Label>
          </FormGroup>
        </FormGroup>
        <Button color="primary" onClick={(e) => this.setValue(e)}>Submit</Button>
      </FormGroup>
    </Form>
        <h3> 2. Get the current value</h3>
        <Form>
          <FormGroup>
            <Button color="primary" onClick={(e) => this.getValue(e)}>Get Value</Button>
            <FormText color="muted">Click the button to get the current value. The initial value is 100.</FormText>
            {this.state.valueGet && this.state.valueGet !== 0 &&
            <p>Current value is <span className="value font-weight-bold">{JSON.stringify( this.state.valueGet)}</span></p>}
          </FormGroup>
        </Form>

        <h3> 3. Contract Calls </h3>
        <p>Javascript calls being made: </p>
        <div className="logs">
          {
            this.state.logs.map((item, i) => <p key={i}>{item}</p>)
          }
        </div>
      </React.Fragment>
    );
  }
}

export default Blockchain;
