const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const depositBoxABI = require('../abi/depositBox.json');
const rpcUrl = "https://rinkeby-light.eth.linkpool.io";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
const config = require('../setConfig.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const schain = config.skale.whispering;
// percentage of tokens from mainnet wallet to bridge over
const percentageOf = 12;// 2 == 50%, 3 = 33% ,4 = 25%, 5 = 20%

const tokenAddress = "0x1245Fb38D4D682C0bFF92b98a6BD34250664e02C";

/*
Bridge ERC20 from mainnet to scahin
sends 10% of balanceOf
*/
async function runTest(tokenA) {
    //DepositBoxERC20 IMA contract on Ethereum
    const depositBoxAddress = config.skale.deposit_box;//DepositBoxERC20
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
        "gasLimit": "280000",
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