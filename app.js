const Web3 = require('web3');

// const web3 = new Web3('wss://ropsten.infura.io/ws/v3/d65c95e0410745d585fe4630fb706c5f');
// const web3 = new Web3('ws://localhost:7545');
const web3 = new Web3('wss://ws.s0.b.hmny.io');

require('dotenv').config();

// const faucetContract = require('../abis/MyFaucetDapp.json');
// const scoreTokenContract = require('../abis/ScoreToken.json');
// const scoreProtocolContract = require('../abis/ScoreProtocol.json');

const faucetContract = require('../contracts/build/contracts/MyFaucetDapp.json');
const scoreTokenContract = require('../contracts/build/contracts/ScoreToken.json');
const scoreProtocolContract = require('../contracts/build/contracts/ScoreProtocol.json');
const ExampleTokenContract = require('../contracts/build/contracts/ExampleToken.json');


const contract = new web3.eth.Contract(faucetContract.abi, faucetContract.networks['1666700000'].address);
const scoreToken = new web3.eth.Contract(scoreTokenContract.abi, scoreTokenContract.networks['1666700000'].address);
const scoreProtocol = new web3.eth.Contract(scoreProtocolContract.abi, scoreProtocolContract.networks['1666700000'].address);
const exampleToken = new web3.eth.Contract(ExampleTokenContract.abi, ExampleTokenContract.networks['1666700000'].address);

const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;


// ask for tokens
async function askForTokens() {
    let tx;

    let bal = await scoreToken.methods.balanceOf(contract.options.address).call();
    let fees = await scoreProtocol.methods.fees().call();
    if(bal < fees){
        console.log("Contract doesn't hold sufficient SCORE Tokens")
        console.log("Sending SCORE tokens ...")
        tx = scoreToken.methods.transfer(contract.options.address, '1000'+'000000000000000000');
        await sendTransaction(tx, scoreToken);
    }

    let balance = await exampleToken.methods.balanceOf(publicKey).call();
    console.log(`Calling sendMeTokens... Current Example-Token balance: ${balance}`);

    tx = contract.methods.sendMeTokens(1000);
    await sendTransaction(tx, contract);

    await new Promise(r => setTimeout(r, 5000));
    balance = await exampleToken.methods.balanceOf(publicKey).call();
    console.log(`Balance on recieving tokens after Score verification: ${balance}`);
}

async function sendTransaction(tx, contract){

    const gas = await tx.estimateGas({ from: publicKey });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(publicKey);
    const txData = {
        from: publicKey,
        to: contract.options.address,
        data: data,
        gas,
        gasPrice,
        nonce,
    };

    const createTransaction = await web3.eth.accounts.signTransaction(
        txData,
        privateKey
    );

    const createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    console.log(
        `Transaction successful with hash: ${createReceipt.transactionHash}`
    );
}


askForTokens()
// check token balance