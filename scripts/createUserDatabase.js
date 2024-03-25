const fs = require('fs');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const users = require('../ruby_modules/users.js')

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);



async function run() {

   // let res = await users.createUserDatabase('testUser.csv', accountOrigin)

    let res = await users.usersHoldingRuby(1,config.assets.europa.RUBY,'rubyUsers.csv', accountOrigin)

    
}

run();