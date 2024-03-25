const ethers = require('ethers');
const bridge = require('./ruby_modules/bridge.js');
const gas = require('./ruby_modules/gasWallet.js');
const trade = require('./ruby_modules/tradeRouter.js');
const config = require('./setConfig.json');
//-----------------------ADJUST---||
const rpcUrl = config.rpc.schainHub;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
//-------------------------------------ADJUST-----||
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

  // Duration that rewards are streamed over
  const rewardsDuration = 86400 * 7;

  // Duration of lock/earned penalty period
  const lockDuration = rewardsDuration * 13;

async function getTx(){

   //Provider 
   const blockNumber = await provider.getBlockNumber();
   console.log(blockNumber)

   const convert = ethers.utils.parseEther(blockNumber.toString())
   console.log("big Number: ",convert)

   let calc_unlockTimeA = convert.div(rewardsDuration).mul(rewardsDuration).add(100)
    console.log(calc_unlockTimeA.toString())
   let calc_unlockTimeB = convert.mul(rewardsDuration).div(rewardsDuration).add(100)
   console.log(calc_unlockTimeB.toString())
}

function run(){
    getTx();
}
run();
