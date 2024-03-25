const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const depositBoxABI = require('../abi/depositBox.json');
const credentials = require('../keys.json');
const config = require('../setConfig.json');


const provider = new ethers.providers.JsonRpcProvider(config.rpc.rinkeby);
const wallet = new ethers.Wallet(credentials.account.privateKeyAdmin2);
const account = wallet.connect(provider);

const schain = config.skale.whispering;
// percentage of tokens from mainnet wallet to bridge over
const percentageOf = 5;// 2 == 50%, 3 = 33% ,4 = 25%, 5 = 20%

const tokenAddress = "0xF10B6447E455f7B1B29899e81E3A25F52A3Adb59";

const depositBoxAddress = config.skale.deposit_box_rinkeby;//DepositBoxERC20

/*
Bridge ERC20 from mainnet to scahin
sends 10% of balanceOf
*/
async function runTest(tokenA) {
   
    const boxContract = new ethers.Contract(depositBoxAddress, depositBoxABI, account);
    // Any erc20 token address
    const usdpContract = new ethers.Contract(tokenA, erc20ABI, account);
    let weiAmount = await usdpContract.balanceOf(account.address);
    let humanAmount = ethers.utils.formatUnits(weiAmount, 18)
    console.log("Balance: ", humanAmount);
    console.log('DepositBoxAddressL ', depositBoxAddress);
    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    let nonce = await account.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce + " GasPrice: " + try_string);

    let objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "28000",
        "nonce": nonce
    }

    let allowanceAmount = await usdpContract.allowance(account.address, depositBoxAddress);
    console.log("allowanceAmount : ", allowanceAmount.toString());
    console.log("balanceAmount : ", weiAmount.toString());


    if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
        console.log("Increased Allowance: ");
        let parse = await usdpContract.approve(depositBoxAddress, weiAmount);
        // const receipt = await parse.wait();
        // console.log("Router Contract Result: ", receipt);
        nonce = await account.getTransactionCount("latest");
    }

    const sendAmount = weiAmount.div(percentageOf);
    console.log("Send Amount: ", sendAmount.toString());

    objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce
    }

    const res = await boxContract.depositERC20(schain, tokenA, sendAmount, objectBlock);
    let ok = await res.wait(1);// wait for 1 block confirmation
    console.log("Transfer Complete");
}

function run() {
    runTest(tokenAddress);
}
run();