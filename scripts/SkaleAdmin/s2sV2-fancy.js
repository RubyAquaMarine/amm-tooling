const ethers = require('ethers');
const schainConfig = require('../schain_modules/utils');
const config = require('../setConfig.json');
const credentials = require('../keys.json');



// change both RPCs
// change the address
// change the destination skale chain name config.skale.

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN ORIGIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


const ORIGIN = config.assets.fancy.USDC;
const TARGET = config.assets.calypsoTest.USDC;
const AMOUNT = '1'


// Origin to Target
async function originToTarget() {
  let res = await schainConfig.sendERC20ToChain(AMOUNT,
    ORIGIN,   // the address on the rpc 
    ORIGIN,   // the address on the origin chain (origin address)
    config.skale_chains.calypsoTest,
    config.skale.token_manager,
    providerOrigin,
    accountOrigin)
}

// Target to Origin
const providerTarget = new ethers.providers.JsonRpcProvider(config.rpc.actual_secret); // SKALE CHAIN
const walletTarget = new ethers.Wallet(credentials.account.privateKey);
const accountTarget = walletTarget.connect(providerTarget);



async function targetToOrigin() {
  let res = await schainConfig.sendERC20ToChain(AMOUNT,
    TARGET,   // the address on the rpc 
    ORIGIN,   // the address on the other chain (origin address)
    config.skale_chains.fancy,
    config.skale.token_manager,
    providerTarget,
    accountTarget)
}


async function run() {


 await originToTarget();

  await targetToOrigin();
}

run();