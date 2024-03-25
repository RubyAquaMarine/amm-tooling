const ethers = require('ethers');
const poolABI = require('../abi/communityPool.json');
const credentials = require('../keys.json');
const config = require('../setConfig.json');
const provider = new ethers.providers.JsonRpcProvider(config.rpc.rinkeby2);
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const poolAddress = config.skale.community_pool_rinkeby;
const poolContract = new ethers.Contract(poolAddress, poolABI, account);
const schain = config.skale_chains.fancy;

async function getCommunityPoolBalance(address) {


    console.log(address);
    console.log(schain);

    let ethBalance = await poolContract.getBalance(address, schain).then(result=>{
        return result;
    }).catch(err=>{
        console.log('err:', err)
    })

    console.log("Pool Balance: " + ethBalance);
    let humanAmount = ethers.utils.formatUnits(ethBalance, 18);
    console.log("Pool Balance norm: " + humanAmount);
    return humanAmount;

}

async function run() {

    let balance = await getCommunityPoolBalance("0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8");
    console.log("GasWallet:", balance)

}
run();
