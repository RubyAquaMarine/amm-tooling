const ethers = require('ethers');
const ethABI = require('../abi/depositBoxEth.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.l1);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const account = walletOrigin.connect(providerOrigin);

const poolAddress = config.skale.deposit_box_eth;

async function claimETHFromBridge(){

    const contract = new ethers.Contract(poolAddress, ethABI, account);
    let res = await contract.gethMyEth()
    console.log(res)

}


const providerTest = new ethers.providers.JsonRpcProvider(config.rpc.rinkeby);

const walletTest = new ethers.Wallet(credentials.account.privateKey);
const accountTest = walletTest.connect(providerTest);

const poolAddressTest = config.skale.deposit_box_eth_rinkeby;

async function claimTestETHFromBridge(){

    const contract = new ethers.Contract(poolAddressTest, ethABI, accountTest);
    let res = await contract.getMyEth().then(result =>{
        console.log(result)
    }).catch(err=>{
        console.log(err)
    })
}


async function run (){
  //  await claimETHFromBridge();
    await claimTestETHFromBridge();
}
run();



