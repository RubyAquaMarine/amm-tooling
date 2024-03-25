const ethers = require('ethers');
const skale = require('../schain_modules/utils');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function chainConnect() {

    let res = await skale.connectSkaleChain(
        config.skale.whispering,
        config.skale.token_linker,
        accountOrigin
    )
  
 
}

async function run() {

    await chainConnect();
}

run();