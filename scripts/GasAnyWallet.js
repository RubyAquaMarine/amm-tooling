const ethers = require('ethers');
const poolABI =  require('../abi/communityPool.json');
const credentials = require('../keys.json');
const config = require('../setConfig.json');

const provider = new ethers.providers.JsonRpcProvider(config.rpc.rinkeby2);          // EDIT
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const poolAddress = config.skale.community_pool_rinkeby;                               //EDIT
const poolContract = new ethers.Contract(poolAddress, poolABI, account);

const transferAmount = "0.000000001";

const anyWalletAddress = "0xfEb0CE242267f19c6E37c6D48a6ce8346809990F";
const schain = config.skale_chains.fancy;                                                  //EDIT

async function fundCommunityPool() {

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    const nonce = await account.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce);


    if(typeof anyWalletAddress === 'undefined' || typeof schain === 'undefined'){
        console.log("BUG: anyWalletAddress : schain : ", anyWalletAddress , schain );
        return;
    }

   // let proxyAddress = await poolContract.messageProxy();
    const ethBalance = await poolContract.getBalance(anyWalletAddress, schain).then(result=>{
        console.log("ethBalance:  " + result);
        return result;
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

    let ok = await poolContract.rechargeUserWallet(schain, anyWalletAddress, objectBlock).then(result => {
        return result;
    }).catch(err=>{
        console.log("Err: poolContract.rechargeUserWallet: ", err)
    })



    ok.wait(1).then(result =>{
        return result;
    }).catch(err=>{
        console.log("Err: poolContract.rechargeUserWallet: ", err)
    })


    console.log(ok)



}

function run() {
    fundCommunityPool();
}
run();
