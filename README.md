# Blockchain project 3: Trustless affiliate marketing
### Conor Henry and Madeline Silva

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
1. Run Ganache GUI and create and then run a new workspace with the following settings:
    - In the Workspace tab under Truffle Projects, use the Add Project button to select the file `~/truffle/truffle-config.js` from the project directory.
    - In the Server tab set the port number to 8545.
2. There are several methods for connecting the test accounts generated by Ganache to Metamask.
    - If you don't already use Metamask, you can choose to import a seed phrase during setup and copy the mnemonic in Ganache that's displayed on the Accounts tab of the workspace.
    - If you do already use Metamask, you can copy your seed phrase from Metamask (visible in Settings -> Security & Privacy -> Reveal Seed Phrase) into the mnemonic field under the Accounts & Keys tab **only while setting up the Ganache workspace not after it's created.**
    - If you use either seed phrase method, you can create new accounts in Metamask and they will correspond to the Ganache accounts in order.
    - If you don't want to use the seed phrase method, you can import Ganache accounts one by one into Metamask by going to Import Account in Metamask and selecting the private key option and then pasting in the private key for each account. You can get each account's private key in Ganache by clicking the key icons on the far right of the list in the Accounts tab.  
3. In Metamask, set the network to Localhost 8545 to connect to Ganache. 

### Running the project
1. Make sure that the Ganache workspace is running.
2. cd into `~/truffle/client` and run:
    - `npm install`
    - `npm run deploy:all`
3. In a separate terminal tab, cd into `~/truffle/client/oracle/test_json` and run `python3 -m http.server` (or equivalent for your Python install).
    - This is so the dummy OpenBazaar transaction JSON can be served to the oracle script. 
4. In a separate teminal tab, cd into `~/truffle/client/oracle` and run `node AffiliateOracle.js`.
    - This script handles requests for an affiliate's transaction information from the oracle contract.
5. In a separate terminal tab, cd into `~/truffle/client/oracle/test_json` and run `python3 tx_generator.py` (or equivalent for your Python install).
    - This script continuously generates dummy OpenBazaar transaction data. 
6. In a separate terminal tab, cd into `~/truffle/client` and run `npm run start`.

### Using the project
The project test website will be available at `http://localhost:3000/`. See the paper for more information about the website. 

**Important**: In order to generate dummy transaction data, you must add the wallet address (which is used as the affiliate code) of each affiliate to the file `~/truffle/client/oracle/test_json/affcodes.txt`, separated by newlines. You don't need to restart `main.py` for changes to this file to take effect, it will start generating dummy transactions with the new affiliate codes in ~10 seconds.

In order to run the demos properly make sure to add at least the first 3 Ganache account wallet addresses to `affcodes.txt` before running.

To run the 2 demo scripts, cd into `~/truffle/client/oracle` and run either `node Demo.js` or `node AffDisputeDemo.js`. AffiliateOracle.js and tx_generator.py should be running before starting the Demos. 
These scripts automate the two example sequences of contract interactions explained in the paper and highlighted on the FSM diagrams. Demo.js demonstrates the expected contract flow and AffDisputeDemo.js demonstrates dispute handling. These demos are intended to show basic contract flow in under 8 minutes, so the terms of the example agreements are not realistic for practical use. 
