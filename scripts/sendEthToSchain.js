const ethers = require('ethers');
const credentials = require('../keys.json');
const config = require('../setConfig.json');
const provider = new ethers.providers.JsonRpcProvider(config.rpc.l1);
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const poolAddress = config.skale.deposit_box_eth;
const poolABI = require('../abi/depositBoxEth.json');
const poolContract = new ethers.Contract(poolAddress, poolABI, account);


const transferAmount = "0.2";
const schain = config.skale.europa;

async function fundSchain() {

    const weiAmount = ethers.utils.parseUnits(transferAmount, 18);

    //Provider 
    const gas_try = await provider.getGasPrice();

    const try_string = gas_try.toString();

    //Signer 
    const nonce = await account.getTransactionCount("latest");

    console.log("TransactionCount: " + nonce);

    const objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce,
        "value": weiAmount
    }

    // console.log("objectBlock: " + objectBlock.toString());

    let ok = await poolContract.deposit(schain, objectBlock);
    await ok.wait(1);
    console.log("Result: " + ok);

}

async function run() {
    await fundSchain();
}
run();
