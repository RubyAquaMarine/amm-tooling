const ethers = require('ethers');
const poolABI =  require('../abi/communityPool.json');
const credentials = require('../keys.json');
const config = require('../setConfig.json');

const provider = new ethers.providers.JsonRpcProvider(config.rpc.l1);          // EDIT
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const poolAddress = config.skale.community_pool;                               //EDIT
const poolContract = new ethers.Contract(poolAddress, poolABI, account);

const transferAmount = "0.01";

const anyWalletAddress = "0x366dD185436f1C55722Fba77fb481E2b038644B6";
const schain = config.skale.europa;                                                  //EDIT

async function fundCommunityPool() {

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    const nonce = await account.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce);

   // let proxyAddress = await poolContract.messageProxy();
    let ethBalance = await poolContract.getBalance(anyWalletAddress, schain).then(result=>{
        console.log("ethBalance:  " + result);
    }).catch(err=>{

        console.log("ethBalance: ERROR " + err);
    })
    console.log("ethBalance: " + ethBalance);

    let weiAmount = ethers.utils.parseUnits(transferAmount,18);
    console.log("weiAmount  " + weiAmount );

    const objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce,
        "value": weiAmount
    }

    let ok = await poolContract.rechargeUserWallet(schain, anyWalletAddress, objectBlock);
    await ok.wait(1);



}

function run() {
    fundCommunityPool();
}
run();
