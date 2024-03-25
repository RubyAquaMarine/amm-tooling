const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const ammu = require('../ruby_modules/utils.js');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function calcDaily(tokenAddress) {
    const addr = await ammu.getLPTokenAddress(tokenAddress);


    console.log("LP address: ", addr)


    let res = await amm.getTokenPrice(addr, accountOrigin);
    return res;
}

async function run() {
    console.log(await calcDaily(config.assets.europa.RUBY));

    console.log(await calcDaily(config.assets.europa.ETH));

    console.log(await calcDaily(config.assets.europa.BTC));

    console.log(await calcDaily(config.assets.europa.SKL));

    console.log(await calcDaily(config.assets.europa.USDP));

    console.log(await calcDaily(config.assets.europa.USDT));

}

run();
