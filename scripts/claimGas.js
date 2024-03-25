const ethers = require('ethers');
const poolABI = require('../abi/communityPool.json');
const credentials = require('../keys.json');
const config = require('../setConfig.json');
const provider = new ethers.providers.JsonRpcProvider(config.rpc.mainnet);
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const poolAddress = config.skale.community_pool;
const poolContract = new ethers.Contract(poolAddress, poolABI, account);
const schain = config.skale.europa;

async function getCommunityPoolBalance() {

    let ethBalance = await poolContract.getBalance(account.address, schain);
    console.log("Pool Balance: " + ethBalance);
    let humanAmount = ethers.utils.formatUnits(ethBalance, 18);

    console.log("Pool Balance norm: " + humanAmount );
    // min amount in community pool 0.002 at all times
    humanAmount = humanAmount - 0.0021;// this was on TEstnet rinkeby and gas prices are more predictable. what are the gasPrices on Rinkeby atm??? 
    console.log("TransferAmount norm: " + humanAmount );

    //ethers.utils.parseUnits(transferAmount , 18);
   // const weiAmount = ethers.utils.formatEther(humanAmount);// wei to eth 
 
    const weiAmount = ethers.utils.parseUnits(humanAmount.toString(), 18);
    
    console.log("Pool Balance norm: " + humanAmount);
    return humanAmount;

}

async function exitCommunityPool(amountToWithdrawl) {

    let ethBalance = await poolContract.getBalance(account.address, schain);

    console.log("Pool Balance: " + ethBalance);

    const weiAmount = amountToWithdrawl;

    //Provider 
    const gas_try = await provider.getGasPrice();

    const try_string = gas_try.toString();

    //Signer 
    const nonce = await account.getTransactionCount("latest");

    console.log("TransactionCount: " + nonce);

    const objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce
    }

    let ok = await poolContract.withdrawFunds(schain, weiAmount, objectBlock);
    await ok.wait(1);


    console.log(

        "\nCommunityPoolAddress: " + poolAddress +
        "\nBalance: " + humanAmount +

        "\nResult: " + ok

    );

}


async function getGasPrice() {
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    console.log("Gas Price: ", try_string);
    let humanAmount = ethers.utils.formatUnits(gas_try, 18);
    return humanAmount;
}

async function getMinimumBalance() {
    const gas_try = await provider.getGasPrice();
    const min = gas_try.mul(1000000);// SKALES CALCULATIONS
    let humanAmount = ethers.utils.formatUnits(min, 18);
    return humanAmount;
}
/*
1 Gwei is 0.000000001 Ether (1 billionth of an Ether)
*/

async function run() {

    let balance = await getCommunityPoolBalance();
    console.log("GasWallet:", balance)
    let gas = await getGasPrice()
    console.log("IN ETH GAS", gas)
    let min = await getMinimumBalance();
    console.log("MinGasWalletBalance: ", min)

    // subtract the min from balance for withdraw amount
    let withdrawal = Number(balance) - Number(min)
    console.log("Wtihdraw Maxmimum: ", withdrawal)
    let withdrawalAmount = ethers.utils.parseUnits(withdrawal.toString(), 18);
    console.log("Wtihdraw Maxmimum wei: ", withdrawalAmount.toString())

    let res = await exitCommunityPool(withdrawalAmount);
}
run();
