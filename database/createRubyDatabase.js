const fs = require('fs');
const ethers = require('ethers');
const users = require('../ruby_modules/users.js')
const config = require('../setConfig.json');
const credentials = require('../keys.json');


//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


async function checkRuby(){
  // input 
    // minimum Token amount 
  let res = await users.usersHoldingRuby(1000,config.assets.europa.RUBY, 'database/database.json','rubyholders_min1000.json', accountOrigin);

}

async function anyToken(){
// input 
    // minimum Token amount 
  let res = await users.usersHoldingRuby(23,'0xC13F81c54273a50f42B1280426d77F6494Cbcf58', 'database/database.json','rubyusdpholders_min23ss.json', accountOrigin); // RUBY-USDP LP

}



async function run() {

  await checkRuby();

//  await anyToken();
  
}

run();