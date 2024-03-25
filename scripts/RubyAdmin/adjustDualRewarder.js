
const chefABI = require('../abi/rubyMasterChef.json');
const lp_pairABI = require('../abi/pair.json');
const rewarderABI = require('../abi/simpleRewarder.json');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const account = walletOrigin.connect(providerOrigin);

const chefAddress = config.amm.masterchef;
const chefContract = new ethers.Contract(chefAddress, chefABI, account);

async function adjustAllRewarderTokenPerSec(emitTokensPerSecondAmount) {

  let count = await chefContract.poolLength();

  let loop = Number(count.toString());

  console.log(" Pool length: ", count.toString());

  console.log("----------------");

  // Print out all the Pool Addresses

  for (let i = 0; i < loop; i++) {

    console.log("----------------");

    let value3 = await chefContract.poolInfo(i);

    const rewarder_address = value3.rewarder

    console.log("Rewarder Contract Address:", value3.rewarder)

    const rewardContract = new ethers.Contract(rewarder_address, rewarderABI, account);

    let value8 = await rewardContract.tokenPerSec()

    //ADMIN PKEY ONLY
    let toWei = ethers.utils.parseEther(emitTokensPerSecondAmount)// kill emmissions
    let rewardRate = await rewardContract.setRewardRate(toWei).then(result => { return result }).catch(err => console.log(err))
    //ADMIN PKEY ONLY
    let value7 = await rewardContract.updatePool()

    let value8new = await rewardContract.tokenPerSec()

    console.log("Token Per Sec old:", value8.toString())

    console.log("Token Per Sec  new:", value8new.toString())

  }
}

async function adjustRewarderTokenPerSec(pool_id, emitTokensPerSecondAmount) {

  let count = await chefContract.poolLength();

  let loop = Number(count.toString());

  console.log(" Pool length: ", count.toString());

  console.log("----------------");

  // Print out all the Pool Addresses

  for (let i = 0; i < loop; i++) {

    if (pool_id == i) {
      console.log("----------------");

      let value3 = await chefContract.poolInfo(i);

      const rewarder_address = value3.rewarder

      console.log("Rewarder Contract Address:", value3.rewarder)

      const rewardContract = new ethers.Contract(rewarder_address, rewarderABI, account);

      let value8 = await rewardContract.tokenPerSec()

      //ADMIN PKEY ONLY
      let toWei = ethers.utils.parseEther(emitTokensPerSecondAmount)// kill emmissions
      let rewardRate = await rewardContract.setRewardRate(toWei).then(result => { return result }).catch(err => console.log(err))
      //ADMIN PKEY ONLY
      let value7 = await rewardContract.updatePool()

      let value8new = await rewardContract.tokenPerSec()

      console.log("Token Per Sec old:", value8.toString())

      console.log("Token Per Sec  new:", value8new.toString())

    }
  }
}

async function run() {
  // KILL EMISSIONS
  //await  adjustAllRewarderTokenPerSec("0.000001");// Kill Emissions on all Dual Rewarders



  // SET ALL DUAL REWARDERS WITH THE SAME EMISSION SCHEDULE
  //await adjustAllRewarderTokenPerSec("1.5");// Set Dual Rewarders with the same TokenPerSec



  // SET UP INDIVIDUAL EMISSION RATES PER POOL
  //await  adjustRewarderTokenPerSec(0,"1");// 1 Token per Second on pool 0 
  //await  adjustRewarderTokenPerSec(1,"2");// 2 Token per Second on pool 1
  //await   adjustRewarderTokenPerSec(2,"3");// 3 Token per Second on pool 2 
}
run();
