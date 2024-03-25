const ethers = require('ethers');
const schainConfig = require('../schain_modules/utils');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function to() {

 const test = await schainConfig.isSkaleChainConnected(
    config.skale_chains.calypsoHub, //
    config.skale.token_linker,
    accountOrigin)

    let res = await schainConfig.sendERC20ToChain('0.0000000000001',
        config.assets.europa.wrap.wETH,
        config.assets.europa.wrap.wETH,
        config.skale_chains.calypsoHub,
        config.skale.token_manager,
        providerOrigin,
        accountOrigin)


}

async function run() {

    await to();
}

run();