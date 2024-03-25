const ethers = require('ethers');
const schainUtils = require('./schain_module/utils.js');
const config = require('../setConfig.json');
const credentials = require('./keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague);  
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(provider);

async function whitelist(tokenAddressOnL1, tokenAddressOnL2){

    await schainUtils.whiteListTokenOnL2(
        "Mainnet",  // This must be mainnet when registering l1 tokens to an schain. 
        tokenAddressOnL1,
        tokenAddressOnL2,
        config.amm.tokenManager,
        accountOrigin 
        )

}


async function run(){

    await whitelist("0x5f138021271f0047863B6B7903052dC5A60EEfbe", "0xb840600e735b1113050fa89a9333069eb53ae52b");// SKL 

    await whitelist("0x0Ac932FB9dB133DFf4ABB099d25E194d3ca90CB7", "0x1343F90aDa7A340b2014fEDEbA7D15772D284B72"); // WBTC

}

run();