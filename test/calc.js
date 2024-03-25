const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewarder = require('../ruby_modules/rewarder.js');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function testTVL() {

    let DAI, USDC, USDP, USDT, BTC, SKL = ''

    const list = {
        DAI,
        USDC,
        USDP,
        USDT,
        BTC,
        SKL
      }
     
      const lenght = Object.keys(list).length;

      console.log("test", lenght)

}

async function run() {

    await testTVL();
}

run();