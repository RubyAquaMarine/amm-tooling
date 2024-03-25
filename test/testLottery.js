const fs = require('fs');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const amm = require('../ruby_modules/amm.js');
const lottery = require('../ruby_modules/lottery.js');

const utils = require('../ruby_modules/utils.js');

//--------------------------------------ADJUST-----------------------------------||

const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);


// two states - current lottery ends and lottery index increase 
//- current lottery is open

const FILE_DEST = 'server/data/lottery.json';

const USDP = config.assets.europa.USDP;

async function run() {

    let res = await lottery.getCurrentLotteryDataV2( USDP, '0x875b6b416536E544A3144977a675e623d8049b89', account);

    console.log(res)

   

}

run();