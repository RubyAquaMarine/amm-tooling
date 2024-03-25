const fs = require('fs');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const users = require('../ruby_modules/users.js')
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

/*
  - saves a json file of ruby amm traders who hold the nft_id:
  - can start at any index

  once the database is completed. use that file to run the other two scripts (Ruby Holders and Ruby Stakers)
*/

const FILE_NAME = 'RubyExchangeUsers.json';

const START_INDEX = 1; // normally zero unless you want to get the latest


async function run() {

  let res = await users.createUserDatabase(START_INDEX, FILE_NAME, accountOrigin);
}

run();