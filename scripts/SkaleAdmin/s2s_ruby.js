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


const ORIGIN = config.assets.fancy.USDP;
const TARGET = '0xb4aaedcA53D17e1f7468cb524B734232C2854294';

/*
0x0BD48B82a1d16483384ddc8E8B9cbF749569284a - ruby target
0xb4aaedcA53D17e1f7468cb524B734232C2854294 - usdp
*/

// Origin to Target
async function originToTarget() {
    let res = await schainConfig.sendERC20ToChain('1000',
        ORIGIN,   // the address on the rpc 
        ORIGIN,   // the address on the origin chain (origin address)
        'actual-secret-cebalrai',
        config.skale.token_manager,
        providerOrigin,
        accountOrigin)
}


const providerTarget = new ethers.providers.JsonRpcProvider(config.rpc.actual_secret); // SKALE CHAIN
const walletTarget = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountTarget = walletTarget.connect(providerTarget);

async function FancyToWhispering() {
    let res = await schainConfig.sendERC20ToChain('10',
       TARGET,   // the address on the rpc 
       ORIGIN,   // the address on the other chain (origin address)
       "fancy-rasalhague",
        config.skale.token_manager,
        providerTarget,
        accountTarget)
}


async function run() {

  // await originToTarget();
   await FancyToWhispering();
}

run();