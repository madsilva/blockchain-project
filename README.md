# blockchain-project

## How to run (subject to change)
1. Make sure you're using node 10.17.0
2. Install:
  - `npm install --g ganache-cli`
  - `npm install --g truffle`
3. Run `ganache-cli` in a terminal tab
4. cd into `truffle/client` directory
5. Run:
  - `truffle compile`
  - `npm install`
  - `npm run deploy:all` (use this to redeploy every time you restart `ganache-cli`, or if you recompile contracts with changes, or if you otherwise need to reset)
6. cd into `test_json` directory and run `python3 -m http.server` in a terminal tab
7. cd back into `client` and run `node AffiliateOracle.js` and `node Client.js` in two terminal tabs

Note: in order to run the React server in `client` using `npm run start`, you have to uncomment `export default getWeb3` at the bottom of the file `truffle/client/src/getWeb3.js` and comment out the `module.exports` statement. In order to run the pure Node.js files, you have to reverse this (for now).