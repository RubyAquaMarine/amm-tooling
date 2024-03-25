const ethers = require('ethers');
const schainConfig = require('../../schain_modules/utils');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');



// change both RPCs
// change the address
// change the destination skale chain name config.skale.

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN ORIGIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const ORIGIN = config.assets.europa.wrap.wETH;
// Origin to Target
async function originToTarget() {
  //0.0000000000000001 - wrapped
  //0.000000000000000001
  let res = await schainConfig.sendERC20ToChain('0.000000000000000001',
    ORIGIN,   // the address on the rpc 
    ORIGIN,   // the address on the origin chain (origin address)
    config.skale_chains.calypsoHub,
    config.skale.token_manager,
    providerOrigin,
    accountOrigin)
}

// Target to Origin
const providerTarget = new ethers.providers.JsonRpcProvider(config.rpc.schainCalypso); // SKALE CHAIN
const walletTarget = new ethers.Wallet(credentials.account.privateKey);
const accountTarget = walletTarget.connect(providerTarget);

const TARGET = config.assets.calypso.ETH;

async function targetToOrigin() {
  let res = await schainConfig.sendERC20ToChain('0.000000000000000001',
    TARGET,   // the address on the rpc 
    ORIGIN,   // the address on the other chain (origin address)
    config.skale_chains.europa,
    config.skale.token_manager,
    providerTarget,
    accountTarget)
}

async function run() {
  
  await originToTarget();
  await targetToOrigin();

}

run();