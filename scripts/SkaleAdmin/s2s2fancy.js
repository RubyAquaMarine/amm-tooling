const ethers = require('ethers');
const schainConfig = require('../../schain_modules/utils');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

//send to 
async function skaleChain() {
    let res = await schainConfig.sendERC20ToChain('99999',
        config.assets.staging_europa.wrap.wSKL,           // L2 token origin address on this RPC
        config.assets.staging_europa.wrap.wSKL,           // L2 token origin address on this RPC
        config.skale_chains.staging.calypso,
        config.skale.token_manager,
        providerOrigin,
        accountOrigin)
}

//send back
async function skaleChainB() {
    let res = await schainConfig.sendERC20ToChain('1',
        '0x10F7521FDF0803fb385429839d87c7284b237F3e',           // L2 token origin address on this RPC
        config.assets.fancy.wrap.wRUBY,           // L2 token origin address on this RPC
        config.skale_chains.fancy,
        config.skale.token_manager,
        providerOrigin,
        accountOrigin)
}

async function run() {
    await skaleChain();
  //  await skaleChainB();
}

run();