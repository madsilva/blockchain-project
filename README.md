# blockchain-project

# How to run
## Prerequisites
- [Ganache GUI](https://www.trufflesuite.com/ganache)
- [Metamask](https://metamask.io/)
  - We have tested the project using Firefox but in theory Chrome should work too.
- Node.js
  - We have tested the project using v14.15.2 LTS.
- Python 3

## Instructions
### Setting up the simulated blockchain
1. Run Ganache GUI and create a new workspace with the following:
    - Under Truffle Projects, use the Add Project button to select the file `~/truffle/truffle-config.js` from the project directory.
    - Under Server set the port number to 8545.
    - **If you're already logged into 

### Running the project
1. Make sure that the Ganache workspace is running.
2. cd into `~/truffle/client` directory and run:
    - `npm install`
    - `npm run deploy:all`
3. In a separate terminal tab, cd into `~/truffle/client/oracle/test_json` and run `python3 -m http.server` (or equivalent for your Python install).
    - This is so the dummy OpenBazaar transaction JSON can be served to the oracle script. 
4. In a separate teminal tab, cd into `~/truffle/client/oracle` and run `node AffiliateOracle.js`.
    - This script handles requests for an affiliate's transaction information from the oracle contract.
5. In a separate terminal tab, cd into `~/truffle/client/oracle/test_json` and run `python3 main.py` (or equivalent for your Python install).
    - This script continuously generates dummy OpenBazaar transaction data. 
6. In a separate terminal tab, cd into `~/truffle/client` and run `npm run start`. The project test website will be available at `http://localhost:3000/`.

### Using the project
In order to generate dummy transaction data, you must add the wallet address (which is used as the affiliate code) of each affiliate to the file `~/truffle/client/oracle/test_json/affcodes.txt`, separated by newlines. You don't need to restart `main.py` for changes to this file to take effect, it will start generating dummy transactions with the new affiliate codes in ~10 seconds.

In order to run the demos properly make sure to add at least the first 3 Ganache account wallet addresses to `affcodes.txt`.

To run the 2 demo scripts, cd into `~/truffle/client/oracle` and run either `node Demo.js` or `node AffDisputeDemo.js`.