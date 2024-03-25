const ethers = require('ethers');
const CRED = require('../keys.json');
const CONSTANTS = require('../Constants.json');
const abi_ob = require('../abi/orderbook.json');

const config = require('../setConfig.json');

//const providerOrigin = new ethers.providers.JsonRpcProvider(CONSTANTS.project.rpc);
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN

const walletOrigin = new ethers.Wallet(CRED.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

// RUBY USDP POOL
const ORDER_BOOK_STORAGE = '0xc893f19B241B214E59c1731f645A9841e4262cFC';

async function loopAMMPools() {
    
    const BASE = config.assets.staging_europa.USDP;
    const XYZ = config.assets.staging_europa.RUBY;
 
    const orderbook = new ethers.Contract(ORDER_BOOK_STORAGE, abi_ob, accountOrigin);
    let approval = await orderbook.setPoolPrice(XYZ, BASE).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    approval = await orderbook.OrdersFilled().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" OrdersFilled: ", approval.toString())

    approval = await orderbook.PoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" PoolPrice", approval.toString())



}

async function run() {
    setInterval(loopAMMPools, 60000 * 1)// 60 sec
}

run();