const ethers = require('ethers');

const schainUtils = require('./schain_module/utils.js');
const config = require('../setConfig.json');
const credentials = require('./keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerMainnet = new ethers.providers.JsonRpcProvider(config.rpc.mainnet);   // RINKEBY ATM L1 RPC
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOriginMainnet = walletOrigin.connect(providerMainnet);
const l1_depositBoxAddress = "0xb3bf0c62f0924e5C8fdae9815355eA98Fba33C8E";

async function whitelist(tokenAddressOnL1){

    await schainUtils.whiteListTokenFromL1(config.skale.fancy,tokenAddressOnL1,l1_depositBoxAddress,accountOriginMainnet)
}


async function run(){

    await whitelist("0x5f138021271f0047863B6B7903052dC5A60EEfbe");// SKL 

    await whitelist("0x0Ac932FB9dB133DFf4ABB099d25E194d3ca90CB7"); // WBTC

}

run();