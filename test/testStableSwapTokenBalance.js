const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
const CONSTANTS = require('../Constants.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


const SS_ADDRESS = CONSTANTS.project.fourPool;
const SS_LP = '0x1534c2eE179B5c307031F8dEF90E66D0D8B72028';

async function testTVL() {

  let  printObject = await amm.stableSwapTokenBalance(SS_LP, SS_ADDRESS, accountOrigin)  //promise 
       
console.log(printObject)
}

async function run() {

    await testTVL();
}

run();