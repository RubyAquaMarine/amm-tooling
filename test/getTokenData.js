const ethers = require('ethers');
const ammu = require('../ruby_modules/utils.js');



const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function testTVL() {

   

    let res = await ammu.getTokenData('0xC13F81c54273a50f42B1280426d77F6494Cbcf58')
    console.log("View : ", res)


 console.log("View : ",   res?.token0symbol)



}

async function run() {

    await testTVL();
}

run();