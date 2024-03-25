const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewarder = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

async function testTVL() {

    let DAI, USDC, USDP, USDT, BTC, SKL = ''

    const list = {
        DAI : config.assets.europa.DAI,
        USDC: config.assets.europa.DAI,
        USDP: config.assets.europa.DAI,
        USDT: config.assets.europa.DAI,
        BTC: config.assets.europa.DAI,
        SKL: 0
      }

      
       // object to array 
       const newArray = Object.entries(list);

       //  
       const newLength =   newArray.unshift(newArray);

       // convert back to an object 
       const newObj = Object.fromEntries(newArray);

       // length
       const length = Object.keys(list).length;

       console.log("test object ", typeof list , list, "length", length)

       console.log("test array ", typeof newArray, newArray)

       console.log("test new object ", typeof newObj, newObj)




}

async function test (){
    const list = {
        DAI: 100,
        USDC: 200,
        USDP: 300,
        USDT: 400,
        BTC: 500,
        SKL: 0
      };
      
      // Convert object to array
      const newArray = Object.entries(list);

      const newLength =   newArray.unshift(newArray);
      
      // Convert array back to object
      const newObj = Object.fromEntries(newArray);

      console.log("test object ", typeof list , list)

      console.log("test array ", typeof newArray, newArray)

      console.log("test new object ", typeof newObj, newObj)
}

async function run() {

    await test()
}

run();