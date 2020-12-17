import React, { Component } from "react";
import {TabContent, TabPane, Nav, NavItem, NavLink, Container} from 'reactstrap';

import getWeb3 from "./getWeb3";
import NewContractForm from "./NewContractForm.js";
import ContractInfoForm from "./ContractInfoForm.js";
import AffiliateActionsForm from "./AffiliateActionsForm.js";
import OwnerActionsForm from "./OwnerActionsForm.js";

class App extends Component {
  state = {
    web3: null,
    activeKey: '1'
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      this.setState({ web3: web3 });
    } catch (error) {
      alert('Failed to load web3. Check console for details.');
      console.error(error);
    }
  };

  handleSelect(key) {
    this.setState({activeKey: key});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3...</div>;
    }
    return (
      <Container>
        <div className="App">
          <Nav tabs>
            <NavItem>
              <NavLink onClick={() => this.handleSelect('1')}>
                Get info about existing contracts
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink onClick={() => this.handleSelect('2')}>
                Create new contract
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink onClick={() => this.handleSelect('3')}>
                Affiliate actions
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink onClick={() => this.handleSelect('4')}>
                Owner actions
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.activeKey}>
            <TabPane tabId="1">
              <ContractInfoForm web3={this.state.web3}/>
            </TabPane>
            <TabPane tabId="2">
              <NewContractForm web3={this.state.web3}/>
            </TabPane>
            <TabPane tabId="3">
              <AffiliateActionsForm web3={this.state.web3}/>
            </TabPane>
            <TabPane tabId="4">
              <OwnerActionsForm web3={this.state.web3}/>
            </TabPane>
          </TabContent>
        </div>
      </Container>
    );
  }
}

export default App;
