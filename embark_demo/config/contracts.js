module.exports = {
  // default applies to all environments
  default: {
    library: 'embarkjs',  // can be also be 'web3'

    // order of connections the dapp should connect to
    dappConnection: [
      "$EMBARK",
      "$WEB3",  // uses pre existing web3 object if available (e.g in Mist)
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    // dappAutoEnable: true,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicitly specified inside the
    //            contracts section.
    // strategy: 'implicit',

    // minimalContractSize, when set to true, tells Embark to generate contract files without the heavy bytecodes
    // Using filteredFields lets you customize which field you want to filter out of the contract file (requires minimalContractSize: true)
    // minimalContractSize: false,
    // filteredFields: [],

    deploy: {
      SimpleStorage: {
        fromIndex: 0,
        args: ["{buyerHandle: \"\",buyerId: \"QmW1fE8BeHQGup7gaNLXx2gM1JP27fyxCaHZDoor5F5WGF\",coinType: \"USD\",moderated: true,orderId: \"QmfYUVq8puk64Vc7FjDv4dE7XHGotJtij9yF6jejLnmrjg\",paymentCoin: \"TLTC\",read: false,shippingAddress: \"1060 W Addison\",shippingName: \"Elwood Blues\",slug: \"eth-physical-order-testing-w-options\",state: \"AWAITING_FULFILLMENT\",thumbnail: \"QmbjyAxYee4y3443kAMLcmRVwggZsRDKiyXnXus1qdJJWz\",timestamp: \"2019-10-02T11:59:49+10:00\",title: \"ETH physical order testing w/ options\",total: \"3559244\",unreadChatMessages: 0}"]
      }
    }
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {},

  // merges with the settings in default
  // used with "embark run privatenet"
  privatenet: {},

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  // custom_name: {}
};
