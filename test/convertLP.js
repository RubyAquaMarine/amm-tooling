const ethers = require('ethers');
const rewards = require('../ruby_modules/rewarder.js');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


const MAKER = config.ammv2.maker;

async function convertLPTokens(pair) {

    pair = pair.toUpperCase();

    if (pair == "ETH") {
        let eth = await rewards.convertLPtoRuby(true, config.assets.fancy.USDP, config.assets.fancy.ETH, MAKER, accountOrigin, providerOrigin)
        return "LP Tokens converted" + eth;
    }
    if (pair == "RUBY") {
        let ruby = await rewards.convertLPtoRuby(true, config.assets.fancy.USDP, config.assets.fancy.RUBY, MAKER, accountOrigin, providerOrigin)
        return "LP Tokens converted" + ruby;
    }
    if (pair == "SKL") {
        let skl = await rewards.convertLPtoRuby(true, config.assets.fancy.USDP, config.assets.fancy.SKL, MAKER, accountOrigin, providerOrigin)
        return "LP Tokens converted" + skl;
    }
    if (pair == "BTC") {
        let btc = await rewards.convertLPtoRuby(true, config.assets.fancy.USDP, config.assets.fancy.BTC, MAKER, accountOrigin, providerOrigin)
        return "LP Tokens converted" + btc;
    }
}

async function run() {

    await convertLPTokens('RUBY');
}

run();