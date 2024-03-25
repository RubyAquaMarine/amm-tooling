const ethers = require('ethers');
const ethABI = require('../abi/depositBoxEth.json');
const credentials = require('../keys.json');
const config = require('../setConfig.json');
const provider = new ethers.providers.JsonRpcProvider(config.rpc.rinkeby2);
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

//const poolAddress = config.skale.deposit_box_eth_rinkeby;//0x9910cF6ba22915C5afCe8b682f7c09d1c001FA59
const poolAddress = "0x9910cF6ba22915C5afCe8b682f7c09d1c001FA59"
const poolContract = new ethers.Contract(poolAddress, ethABI, account);

const transferAmount = "0.0000000001";
const schain = config.skale_chain.fancy;

async function fundSchain() {

    const weiAmount = ethers.utils.parseUnits(transferAmount, 18);

    //Provider 
    const gas_try = await provider.getGasPrice();

    const try_string = gas_try.toString();

    //Signer 
    const nonce = await account.getTransactionCount("latest");

    const objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce,
        "value": weiAmount
    }

    console.log("objectBlock: " + objectBlock);
    console.log("to SChain " + schain);
    let ok = await poolContract.deposit(schain, objectBlock);
    await ok.wait(1);
    console.log("Result: " + ok);

}

function run() {
    fundSchain();
}
run();
