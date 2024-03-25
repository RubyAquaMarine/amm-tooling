const ethers = require('ethers');
const schain = require('../../schain_modules/utils.js');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Nebula); // SKALE CHAIN
//--------------------------------------ADJUST-----------------------------------||
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

// is connected to Europa
const CHECK_CHAIN = config.skale_chains.mainnet.europa;

async function test() {
    console.log('RPC:', providerOrigin.connection,'User:', accountOrigin.address)
    // networks 
    await schain.isSkaleChainConnected(CHECK_CHAIN, config.skale.token_linker, accountOrigin);
    await schain.isSkaleChainConnectedV2(CHECK_CHAIN, config.skale.message_proxy_chain_address, accountOrigin)
}

async function run() {
    await test();
}

run();

// brawl  connected
// calypso  connected
// crypto blades connected



// nebula not connected 
// razor not connected
// crypto c not connected