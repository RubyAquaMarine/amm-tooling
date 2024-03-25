const ethers = require('ethers');
const schainConfig = require('../schain_modules/utils');
const config = require('../setConfig.json');
const credentials = require('../keys.json');



// change both RPCs
  // change the address
  // change the destination skale chain name config.skale.


// try to send usdp to whispering 




//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN ORIGIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);


const ORIGIN = config.assets.fancy.BTC;
const TARGET = '0x49aE5B287AF1c729FdaEcd2BEe471160f3EF273E';

// Origin to Target
async function originToTarget() {
    let res = await schainConfig.sendERC20ToChain('0.0000001',
        ORIGIN,   // the address on the rpc 
        ORIGIN,   // the address on the origin chain (origin address)
        config.skale.calypsoTest,
        config.skale.token_manager,
        providerOrigin,
        accountOrigin)
}

// Target to Origin
const providerTarget = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN
const walletTarget = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountTarget = walletTarget.connect(providerTarget);

async function FancyToWhispering() {
    let res = await schainConfig.sendERC20ToChain('0.555',
       TARGET,   // the address on the rpc 
       ORIGIN,   // the address on the other chain (origin address)
       "glamorous-grumium",
        config.skale.token_manager,
        providerTarget,
        accountTarget)
}


async function run() {

    
   await originToTarget();
}

run();