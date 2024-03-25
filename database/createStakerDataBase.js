const fs = require('fs');
const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const users = require('../ruby_modules/users.js')
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const DATA_BASE = 'database.json';

const OUTPUT_FILENAME = 'stakers_min100ss.json'

const MIN_STAKED_AMOUNT = 100;


async function run() {

 let test = await users.usersStakingRuby(MIN_STAKED_AMOUNT , DATA_BASE, OUTPUT_FILENAME , config.amm.stake, accountOrigin);
  
}

run();