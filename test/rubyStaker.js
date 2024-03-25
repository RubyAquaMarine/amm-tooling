const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewards = require('../ruby_modules/rewarder.js');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
const CONSTANTS = require('../Constants.json');
const STAKER = CONSTANTS.project.stake;
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function testTVL() {

    let staking = await rewards.viewRewardsAPR(STAKER, accountOrigin).then(result => {
        return result;
    }).catch(err => {
        console.log("reportRubyStaker Error: ", err)
    })

    if (typeof staking === 'undefined') {
        console.log("viewRewardsAPR Error: ")
        return;
    }

    staking_apr = staking[1];
    locked_apr = staking[0];

  

}

async function run() {

    await testTVL();
}

run();