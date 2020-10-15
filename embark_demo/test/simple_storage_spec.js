/*global artifacts, contract, config, it, assert, web3*/
const SimpleStorage = artifacts.require('SimpleStorage');

let accounts;

// For documentation please see https://framework.embarklabs.io/docs/contracts_testing.html
config({
  //blockchain: {
  //  accounts: [
  //    // you can configure custom accounts with a custom balance
  //    // see https://framework.embarklabs.io/docs/contracts_testing.html#Configuring-accounts
  //  ]
  //},
  contracts: {
    deploy: {
      "SimpleStorage": {
        args: ["{buyerHandle: \"\",buyerId: \"QmW1fE8BeHQGup7gaNLXx2gM1JP27fyxCaHZDoor5F5WGF\",coinType: \"USD\",moderated: true,orderId: \"QmfYUVq8puk64Vc7FjDv4dE7XHGotJtij9yF6jejLnmrjg\",paymentCoin: \"TLTC\",read: false,shippingAddress: \"1060 W Addison\",shippingName: \"Elwood Blues\",slug: \"eth-physical-order-testing-w-options\",state: \"AWAITING_FULFILLMENT\",thumbnail: \"QmbjyAxYee4y3443kAMLcmRVwggZsRDKiyXnXus1qdJJWz\",timestamp: \"2019-10-02T11:59:49+10:00\",title: \"ETH physical order testing w/ options\",total: \"3559244\",unreadChatMessages: 0}"]
      }
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts;
});

contract("SimpleStorage", function () {
  this.timeout(0);

  it("should set constructor value", async function () {
    let result = await SimpleStorage.methods.storedData().call();
    assert.strictEqual(parseInt(result, 10), 100);
  });

  it("set storage value", async function () {
    await SimpleStorage.methods.set(150).send({from: web3.eth.defaultAccount});
    let result = await SimpleStorage.methods.get().call();
    assert.strictEqual(parseInt(result, 10), 150);
  });

  it("should have account with balance", async function() {
    let balance = await web3.eth.getBalance(accounts[0]);
    assert.ok(parseInt(balance, 10) > 0);
  });
});
