const fs = require('fs');
const ethers = require('ethers');
const init_amm = require('../ruby_modules/init.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

/*
    Working with new design pattern
*/


const FILE_NAME = "EuropaChainList.json";
const FILE_IMPORT = "./EuropaChainList.json";

async function amm() {
    let test = await init_amm.initAMM(config.amm.lotteryFactory, config.amm.masterchef, config.amm.factory, config.amm.fourPool, config.amm.fourPoolLP, accountOrigin);
    test = JSON.stringify(test)
    fs.writeFileSync(FILE_NAME, test);
    console.log(" INIT AMM:", test)
}

//const CONSTANTS = require('./EuropaChainList.json')

/* LAZY LOADING
Well it's a matter of practice, some guys like it at the top while some like lazy-loading. 
In my opinion both are good, and should be used as per need, so I think that author is right here, 
because loading a whole bunch libraries at the startup would overload the module with much of the stuff that is never used, 
and hence would increase the load-time. And although loading the libraries on demand is a synchronous operation, 
but if we look help method as an entity, then it would give an asynchronous module loading effect (see AMD, which is a popular pattern).
Lazy loading is also a good selection if you have to make a choice between which libraries to load in a particular case, like for example
*/

async function testConstants() {

    const CONSTANTS = require(FILE_IMPORT)// is this possible?

    let ammPoolCount = CONSTANTS.data.length;
    // token addresses
    let rubyAddress = CONSTANTS.data[0].token0address;
    let usdpAddress = CONSTANTS.data[0].token1address;
    let ethAddress = CONSTANTS.data[1].token1address;
    let btcAddress = CONSTANTS.data[2].token1address;
    let sklAddress = CONSTANTS.data[3].token1address;
    //-- lp token addresses
    let rubyLPAddress = CONSTANTS.data[0].poolAddress;
    let ethLPAddress = CONSTANTS.data[1].poolAddress;
    let btcLPAddress = CONSTANTS.data[2].poolAddress;
    let sklLPAddress = CONSTANTS.data[3].poolAddress;
    //-- symbols
    let RUBY = CONSTANTS.data[0].token0symbol;
    let ETH = CONSTANTS.data[1].token1symbol;
    let BTC = CONSTANTS.data[2].token1symbol;
    let SKL = CONSTANTS.data[3].token1symbol;

    console.log(rubyAddress + " | " + usdpAddress)

}

async function run() {

    await amm();
    await testConstants();
}

run();