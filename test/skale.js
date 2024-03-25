const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewarder = require('../ruby_modules/rewarder.js');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function testTVL() {
    let index = 0;
    let res = await providerOrigin.getTransactionByBlockNumberAndIndex('latest',index.toString(16)).then(result=>{
        return result;
    }).catch(err=>{
        console.log(err);
    })

    console.log( res)
}

async function test() {
    let index = 0;
    let res = await providerOrigin.getTransactionByBlockNumberAndIndex('latest',index.toString(16)).then(result=>{
        return result;
    }).catch(err=>{
        console.log(err);
    })

    console.log( res)
}

async function run() {

    await test();

  //  await testTVL();
}

run();