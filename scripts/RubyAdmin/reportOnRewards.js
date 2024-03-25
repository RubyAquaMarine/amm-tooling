
const chefABI = require('../abi/rubyMasterChef.json');
const erc20ABI = require('../abi/erc20.json');
const lp_pairABI = require('../abi/pair.json');
const rewarderABI = require('../abi/simpleRewarder.json');
const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const account = walletOrigin.connect(providerOrigin);

const chefAddress = config.amm.masterchef;
const chefContract = new ethers.Contract(chefAddress, chefABI, account);

async function reportRewards() {

  let count = await chefContract.poolLength();

  let loop = Number(count.toString());

  console.log(" Pool length: ", count.toString());

  // Print out all the Pool Addresses
  for (let i = 0; i < loop; i++) {

    console.log("----------------");

    let value3 = await chefContract.poolInfo(i);

    const rewarder_address = value3.rewarder

    console.log("Rewarder Contract Address:", value3.rewarder)

    // Dual Rewarder contract exists
    if (rewarder_address != '0x0000000000000000000000000000000000000000' && rewarder_address != chefAddress) {

      const rewardContract = new ethers.Contract(rewarder_address, rewarderABI, account);

      let rewardTokenAddress = await rewardContract.rewardToken()

      let mintRate = await rewardContract.tokenPerSec() //wei amount

      let notWeiMintRate = ethers.utils.formatUnits(mintRate, 18)

      // get the token
      const tokenContract = new ethers.Contract(rewardTokenAddress, erc20ABI, account);

      const sym = await tokenContract.symbol()

      let balanceOf = await tokenContract.balanceOf(rewarder_address);

      let dec = await tokenContract.decimals();

      let notWeibalanceOf = ethers.utils.formatUnits(balanceOf, dec)

      console.log("Rewarder Contract Remaining Balance (wei):", balanceOf.toString())

      console.log("Rewarder Contract Remaining Balance:", notWeibalanceOf)

      console.log("Rewarder Token: ", sym)

      console.log("Rewarder Mint Rate (wei):", mintRate.toString())

      console.log("Rewarder Mint Rate:", notWeiMintRate)

      // then figure out how much time before rewards run out
      // 1 ruby per second
      // 1min , 60 
      // 1 hour 3600
      // 1 day 86400 (seconds in 1 day)

      // 100k usdp , want a duration of 30 days 
      // 100,000 / 30 = how many tokens per day
      // 3333
      //3,333 usdp daily / 86400 = 
      // 0.03858 USDP per Second 


      // Total amount emitted each day
      let mintedDaily = ethers.utils.parseUnits(notWeiMintRate, 18)// to big
      mintedDaily = mintedDaily.mul(86400)
      let notWeimintedDaily = ethers.utils.formatUnits(mintedDaily, 18)// to string
      console.log("Daily Amount Minted:", notWeimintedDaily)

      // days left until rewards are empty
      let remainingDay = balanceOf.div(mintRate.mul(86400))
      console.log("Remaining Days:", remainingDay.toString())

    }
  }
}

async function reportMasterchef() {

  const ruby = new ethers.Contract(config.assets.europa.RUBY, erc20ABI, account);
  let balance = await ruby.balanceOf(chefAddress);
  let bal = ethers.utils.formatUnits(balance, 18);

  console.log("MASTERCHEF RUBY BALANCE: ", bal)
  console.log("----------------");

}


async function run() {
  await reportMasterchef()
  await reportRewards()
}
run();
