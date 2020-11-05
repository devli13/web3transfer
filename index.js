// Getting Started and setting up environment:
// run 'npm install web3' within directory
// run 'npm install etheereeumjs-tx' within directory
// run 'node test_web3.js' (or whatever this file is called)


const Web3 = require("web3");
const Tx = require('ethereumjs-tx').Transaction

// Establish connection to RPC url
var web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/5190ef1a7a674125a3d36613d70e6301"));

// Contract Address for ERC20
const address = "0xD8a6141b578c03E9E43191a1BFb46e228588DF82";
// ABI for contract
const ABI = require("./wow.json");

// Verify web3 version for testing
var version = web3.version;
console.log("version:", version)

// Confirm connection is open to RPC url
web3.eth.net.isListening()
.then(console.log("Is Listening: True"))
.catch(e => console.log('Wow. Something went wrong', e))

// Create variable that hold smart-contract connction for function calls
const myContract = new web3.eth.Contract(ABI, address);

// public/private keys for sender and recipient
// must have private key for sender only
const liams_wallet = "0x5F58AE12838C969de38a3457247DFECb15d90274"
myContract.methods.balanceOf(liams_wallet).call((err, result) => { console.log("Balance before transfer for liams_wallet: ",result) })
const liams_key = "96a4981f8c738b96cba606ab832fa954e867108da6378fb377368605cdf13e10" // Liam's Private Key for signing th txn below
const shriyas_wallet = "0xE8c4fECd334Eb8c83cFd364211B698afc3C2b9F3"
myContract.methods.balanceOf(shriyas_wallet).call((err, result) => { console.log("Balance before transfer for shriyas_wallet: ",result) })



// Convert priivate keys to binary
const privateKey1 = Buffer.from(liams_key, 'hex')

// Specify godTransfer function
const contractFunction = myContract.methods.godTransfer(liams_wallet, [shriyas_wallet], [3]); // Here you can call your contract functions
// Encode ABI
const functionAbi = contractFunction.encodeABI();

let estimatedGas;
let nonce;

console.log("Getting gas estimate...");

// All logic for executing godTransfer
contractFunction.estimateGas({from: liams_wallet}).then((gasAmount) => {
  estimatedGas = gasAmount.toString(16);

  console.log("Estimated gas: " + estimatedGas);

  web3.eth.getTransactionCount(liams_wallet).then(_nonce => {
    nonce = _nonce.toString(16);

    // Bundle all information for txn
    console.log("Nonce: " + nonce);
    const txParams = {
      gasPrice: 100000,
      gasLimit: 3000000,
      to: address,
      data: functionAbi,
      from: liams_wallet,
      nonce: '0x' + nonce
    };

    // Sign txn with private key using ethereumjs-tx
    const tx = new Tx(txParams, {chain:'goerli'});
    tx.sign(privateKey1); // Transaction Signing here

    const serializedTx = tx.serialize();

    // Execute signed txn
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', receipt => {
      console.log(receipt);
    })
  });
});

// Get ETHER balance
web3.eth.getBalance(shriyas_wallet, function(err, result) {
        if (err) {
          console.log("ERROR!", err)
        } else {
          console.log(web3.utils.fromWei(result, "ether") + " ETHER!")
        }
      })

// Simple test functions on contract
// Total supply of custom ERC20 token
myContract.methods.totalSupply().call((err, result) => { console.log("Total Supply (in gwei): ", result) })
// Name of custom ERC20 token
myContract.methods.name().call((err, result) => { console.log("Name: ", result) })
// Symbol of custom ERC20 token
myContract.methods.symbol().call((err, result) => { console.log("Symbol: ",result) })





// Several Curls to test infura connection if needed. Run directly in terminal:

// curl https://goerli.infura.io/v3/5190ef1a7a674125a3d36613d70e6301
//     -X POST \
//     -H "Content-Type: application/json" \
//     -d '{"jsonrpc":"2.0","method":"eth_getBalance","params": ["0x5F58AE12838C969de38a3457247DFECb15d90274", "latest"],"id":1}'

// curl --user :f99bfc9b73dd4eb88d768adf4e327de3 \
//   https://goerli.infura.io/v3/5190ef1a7a674125a3d36613d70e6301

// curl https://mainnet.infura.io/v3/67c18e7756b543a7b8f89a1f1a0fc505
//     -X POST \
//     -H "Content-Type: application/json" \
//     -d '{"jsonrpc":"2.0","method":"eth_getBalance","params": ["0x5F58AE12838C969de38a3457247DFECb15d90274", "latest"],"id":1}'

// curl -k -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getBalance","params": ["0x5F58AE12838C969de38a3457247DFECb15d90274", "latest"],"id":1}' https://goerli.infura.io/v3/5190ef1a7a674125a3d36613d70e6301
