const ethers = require('ethers');
const schainConfig = require('../schain_modules/utils');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


// origin token address is being used in both directions ( target token is not used and is only required to call the values on the rpc)


const TOKEN = config.assets.fancy.RUBY;

// Origin to Target

async function fancyToWhispering() {
    let res = await schainConfig.sendERC20ToChain('0.5',
        TOKEN,
        TOKEN,
        config.skale_chains.whispering,
        config.skale.token_manager,
        providerOrigin,
        accountOrigin)
}

async function run() {

    await fancyToWhispering();
}

run();