const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewarder = require('../ruby_modules/rewarder.js');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
const { parseValue } = require('graphql');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function testTVL() {

    const t_fees = 100;// total ss fees earned
    const value = 0.0004; // ss fee 0.04% 
    const diff = 1 - value;
    console.log(" times diff: ", diff)
    const y =  Number(Math.round(value * diff  + "e4") + "e-4")
    console.log(" y: ", y)
    const x = t_fees / y;
    console.log(" x: ", x)
    const fee = x* value;
    console.log(" fees: ", fee)
    if( fee == t_fees){
        console.log("MATCHES")
    }
}

async function run() {

    await testTVL();
}

run();