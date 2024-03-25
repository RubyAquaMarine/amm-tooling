const ethers = require('ethers');
const rewarder = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const staker = config.ammv2.stake;

async function testTVL() {

    console.log(await rewarder.getAMMRewards(staker, accountOrigin))

    console.log(await rewarder.withdrawExpiredLocks(staker, accountOrigin))


}

async function run() {

    await testTVL();
}

run();