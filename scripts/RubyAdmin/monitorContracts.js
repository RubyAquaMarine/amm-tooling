//node scripts/RubyAdmin/MonitorContracts.js
/*
  working with dual rewards
*/
const ethers = require('ethers');
const amm = require('../../ruby_modules/amm.js');
const rewards = require('../../ruby_modules/rewarder.js');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
const factoryABI = require('../../abi/factory.json');
const routerABI = require('../../abi/amm_router.json');
const CONSTANTS = require('../../Constants.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const routerAddress = config.amm.router;
const chefAddress = config.amm.masterchef;
const stakerAddress = config.amm.stake;
const ssAddress = config.amm.fourPool;

const rubyLPAddress = CONSTANTS.data[0].poolAddress;
const sklLPAddress = CONSTANTS.data[3].poolAddress;



function format18(USDP_RESERVES) {
  const usdp = ethers.utils.formatUnits(USDP_RESERVES, 18)
  return usdp
}

async function checkPrices() {

  console.log("-------------------------------------")

  let chefBalance = await amm.checkTokenBalance(config.assets.europa.RUBY, chefAddress, accountOrigin)
  console.log("RubyMasterChef: Ruby Balance: ", chefBalance)

  let rubyPerSec = await rewards.getRubyPerSecond(chefAddress, accountOrigin);
  console.log("RubyMasterChef: Ruby Per Second: ", rubyPerSec)

  let stakerBalance = await rewards.reportRubyStaker(stakerAddress, accountOrigin)
  console.log("RubyStaker: Total Ruby Staked + Locked: ", stakerBalance)

  // Needs the lp address of the 4pool 
  let ssTVL = await amm.stableSwapTokenBalance("0x1534c2eE179B5c307031F8dEF90E66D0D8B72028", ssAddress, accountOrigin)
  console.log("StableSwap:  TVL: ", ssTVL)

  let swapFees = await amm.getAdminFeeBalances(ssAddress, accountOrigin)
  console.log("StableSwap:  collected Fees: ", swapFees)

  //  let eth = await rewards.convertLPtoRuby(false, config.assets.europa.USDP, config.assets.europa.ETH, config.amm.maker, accountOrigin,providerOrigin)

  //  let skl = await rewards.convertLPtoRuby(false, config.assets.europa.USDP, config.assets.europa.SKL, config.amm.maker, accountOrigin,providerOrigin)

  //  let btc = await rewards.convertLPtoRuby(false, config.assets.europa.USDP, config.assets.europa.BTC, config.amm.maker, accountOrigin,providerOrigin)

    let ruby = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.RUBY, config.amm.maker, accountOrigin,providerOrigin)

  console.log("========================================")
  await getAllFarms();

}


// returns all the AMM pool reserves, price, and tvl
async function getAllFarms() {

  // get Ruby Price to calculate APY on farming pools
  const rubyPrice = await amm.getTokenPrice(rubyLPAddress, accountOrigin)
  if (rubyPrice == undefined || rubyPrice <= 0) {
    console.log("BUG IN RUBY PRICE")
    return;
  }

  console.log(" Getting Farming Data")
  console.log(" Getting the Ruby Token Price: ", rubyPrice);

  const account = accountOrigin;
  const routerContract = new ethers.Contract(routerAddress, routerABI, account);
  const factoryAddress = await routerContract.factory();
  const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
  // Get the number of Pools within the Factory contract
  let value = await factoryContract.allPairsLength();
  let valueS = Number(value.toString());


  let printObject;
  // Print out all the Pool Addresses
  for (let i = 0; i < valueS; i++) {// plus 1 for the stableswap pool? 
    let value3 = await factoryContract.allPairs(i);
    let pairAddress = value3.toString();
    // Pool Price, TVL , token name, 
    printObject = await amm.getAMMPoolTVL(pairAddress, account);
    console.log(printObject)
    let poolPrice = printObject?.poolPrice;
    let tvl = printObject?.tvl;

    // test functions 
    let testLP = await rewards.getFarmTVL(tvl, pairAddress, chefAddress, account)
    console.log("farmTVL: ", testLP)


    let testFarmRewards = await rewards.findFarmPoolShare(pairAddress, chefAddress, account)
    let rewardsinUSD = testFarmRewards?.poolRubyPerYear * rubyPrice;
    let apy = (rewardsinUSD / testLP?.farmTVL) * 100;
    rewardsinUSD = rewardsinUSD.toFixed(2)// to string
    apy = apy.toFixed(2)// to string

    console.log("farmAPY: ", apy)
    console.log("farmRewards: ", testFarmRewards)
    console.log("farmRewards(USD): ", rewardsinUSD)

    // dual farm apy 
    // get price , match the token 
    let dualfarm_rewardsinUSD;
    let dualRewardAPY;
    if (testFarmRewards?.poolDualRewardToken == "USDP") {

      dualfarm_rewardsinUSD = testFarmRewards?.poolDualRewardPerYear;
      dualRewardAPY = (dualfarm_rewardsinUSD / testLP?.farmTVL) * 100;

      console.log("dualRewardAPY", dualRewardAPY)

    } else if (testFarmRewards?.poolDualRewardToken == "SKL") {

      let TokenPrice = await amm.getTokenPrice(sklLPAddress, account);
      console.log("GET SKL PRICE", TokenPrice)
      dualfarm_rewardsinUSD = testFarmRewards?.poolDualRewardPerYear * TokenPrice;
      dualRewardAPY = (dualfarm_rewardsinUSD / testLP?.farmTVL) * 100;

      console.log("dualRewardAPY", dualRewardAPY)

    }
  }
}


async function run() {

  console.log("Script Started: waiting for timer")

  setInterval(checkPrices, 60000 * 1)// 60 seconds
  // setInterval(checkPrices,60000*10)// 10 mimute
}

run();
