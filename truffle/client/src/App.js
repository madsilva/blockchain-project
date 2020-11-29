import React, { Component } from "react";
import getWeb3 from "./getWeb3";

import "./App.css";
import MainForm from "./form.js";

var contract = require("@truffle/contract");
const AffiliateContractJSON = require('./contracts/AffiliateContract.json')
const AffiliateOracleContractJSON = require('./contracts/AffiliateOracle.json')

class App extends Component {
  state = { web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      
      
      this.setState({ web3, accounts });
      //this.runExample();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { web3, accounts } = this.state;

    var AffiliateOracleContract = contract({abi: AffiliateOracleContractJSON.abi});
    AffiliateOracleContract.setProvider(web3.currentProvider);
    const networkId = await web3.eth.net.getId();
    AffiliateOracleContract.setNetwork(networkId);
    var address = AffiliateOracleContractJSON.networks[networkId].address
    var oracle = await AffiliateOracleContract.at(address);
    console.log(oracle);
    var AffiliateContract = contract({abi: AffiliateContractJSON.abi, bytecode: AffiliateContractJSON.bytecode});
    AffiliateContract.setProvider(web3.currentProvider);



    var newContract = await AffiliateContract.new('0x28E070e1c37B8b48379D49b531FB65853974AFb3', address, 3, 300, 300, 10000, 10000, 10, {value: 20000, from: accounts[0]});
    console.log("new");
    console.log(newContract);
    newContract.getMainContractStateInfo({from: accounts[0]}).then(function(result) {
      console.log(result.logs[0].args.currentSubcontract);

    })

    //console.log(AffiliateContract);
    // Stores a given value, 5 by default.
    //await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    //const response = await contract.methods.get().call();

    // Update state with the result.
    //this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <MainForm />
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored value is: </div>
      </div>
    );
  }
}

export default App;
