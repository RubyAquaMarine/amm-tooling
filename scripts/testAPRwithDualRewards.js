// node scripts/testaprwithdualrewards
/*
    old code : usable but not fully tested (dual rewards apr integration)
    use aprTelegram.js or montitorContracts.js for updated code
*/
const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewards = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const USDP_ADDRESS = config.assets.europa.USDP;
const STABLE_LP_ADDRESS = "0x1534c2eE179B5c307031F8dEF90E66D0D8B72028";
const RUBY_LP_ADDRESS = "0xC13F81c54273a50f42B1280426d77F6494Cbcf58";
const CHEF_ADDRESS = config.amm.masterchef;
const STABLESWAP_ADDRESS = config.amm.fourPool;
const FACTORY_ADDRESS = config.amm.factory;

async function isStableSwap(LpTokenAddress) {
    if (LpTokenAddress == STABLE_LP_ADDRESS) {
        return true;
    }
    return false;
}

async function getRubyPrice() {
    const rubyPrice = await amm.getTokenPrice(RUBY_LP_ADDRESS, accountOrigin)
    if (rubyPrice == undefined || rubyPrice <= 0) {
        console.log("BUG IN RUBY PRICE")
        return 0;
    }
    return rubyPrice;
}

// need to fix the SS amm pool structure 
async function getAMMData(ruby, LpTokenAddress) {
    // get ruby price: required to calculate the USD Value of rewards from the pool
    const rubyPrice = ruby;
    if (rubyPrice == undefined || rubyPrice <= 0) {
        console.log("BUG IN RUBY PRICE")
        return;
    }

    let isStableSwapLogic = await isStableSwap(LpTokenAddress);

    let ammPool;
    if (isStableSwapLogic) {
        console.log("STABLE SWAP FOUND")
        ammPool = await amm.stableSwapTokenBalance(LpTokenAddress, STABLESWAP_ADDRESS, accountOrigin);
    } else {
        console.log("AMM FOUND")
        ammPool = await amm.getAMMPoolTVL(LpTokenAddress, accountOrigin);
    }


    //console.log("AMMPoolTVL: ", ammPool);
    /*
        AMMPoolTVL:  {
        poolPrice: 0.2369144014109191,
        address: '0xC13F81c54273a50f42B1280426d77F6494Cbcf58',
        isSS: false,
        token0: {
            name: 'RUBY',
            address: '0x2B4e4899b53E8b7958c4591a6d02f9C0b5c50F8f',
            price: 0.2369144014109191
        },
        token1: {
            name: 'USDP',
            address: '0x73d22d8a2D1f59Bf5Bcf62cA382481a2073FAF58',
            price: 1
        },
        reserves0: 1474542.3014886042,
        reserves1: 349340.3067122517,
        tvl: 698680.6134245034
        }
    */
    return ammPool;
}

// updated to include apr logic for dual rewarder
async function getFarmData(ruby, ammObject, LpTokenAddress) {
    const rubyPrice = ruby;
    if (rubyPrice == undefined || rubyPrice <= 0) {
        console.log("BUG IN RUBY PRICE")
        return;
    }

    let isStableSwapLogic = ammObject?.isSS;

    let ammPool = ammObject;

    // let poolPrice = resPool?.poolPrice;
    const tvlAMM = ammPool?.tvl;


    const farmPool = await rewards.getFarmTVL(tvlAMM, LpTokenAddress, CHEF_ADDRESS, accountOrigin)
    //console.log("get FARM TVL (): ", farmPool)
    /*
        totalSupply: 717248.4249161883,
        lpTokenPrice: 0.9741124401997053,
        ammTVL: 698680.6134245034,
        farmTVL: 39780.26873095897
    */

    const farm = await rewards.findFarmPoolShare(LpTokenAddress, CHEF_ADDRESS, accountOrigin)
    // console.log("testFarmRewards: ", farm)
    /*
        testFarmRewards:  {
        poolAddress: '0xC13F81c54273a50f42B1280426d77F6494Cbcf58',
        poolRubyPerDay: 2280.96,
        poolRubyPerYear: 832550.4,
        poolShare: 0.24,
        poolDualRewardAdress: '0x84348018FbC9705F4CB43c065ad4a70E4472360b',
        poolDualRewardPerDay: 0,
        poolDualRewardPerYear: 0,
        poolDualRewardEnds: 0,
        poolDualRewardToken: 'SKL',
          poolDualRewardTokenAddress: rewardTokenAddress,
        poolDualRewardBalance: 0,
        poolDualRewardMintRate: 0
}
    */

    let rewardsinUSD = farm?.poolRubyPerYear * rubyPrice;
    let apyFarm = (rewardsinUSD / farmPool?.farmTVL) * 100;

    // todo 
    // add the dual Rewards ROI into the apy 

    let ifDualReward = farm?.poolDualRewardTokenAddress;
    let getTokenPrice;
    if (ifDualReward != undefined) {

        getTokenPrice = await amm.getTokenPriceFromSymbol(ifDualReward,  accountOrigin);
        let testDR = farm?.poolDualRewardPerYear;
        if (testDR == 0) {
            testDR = 1;// prevent zero divide while rewards are off
        }
        let rewardsinUSDonDR = testDR * getTokenPrice;
        let apyFarmDR = (rewardsinUSDonDR / farmPool?.farmTVL) * 100;
        console.log("apyFarmDR", apyFarmDR)
        console.log("rewardsinUSDonDR", rewardsinUSDonDR)
        console.log("getTokenPrice ", getTokenPrice)
        apyFarm = apyFarm + apyFarmDR;
    } else {

        console.log("No Dual Rewards on this Pool")
    }


    let objectOut;

    if (isStableSwapLogic) {
        objectOut = {
            lptokenAddress: LpTokenAddress,
            isSSLpToken: isStableSwapLogic,
            token0: ammPool?.token0,
            token1: ammPool?.token1,
            token2: ammPool?.token2,
            token3: ammPool?.token3,
            rewards:
            {
                name: "RUBY",
                amountDay: farm?.poolRubyPerDay,
                allocPoint: farm?.poolShare * 1000,
                allocPercent: farm?.poolShare * 100
            },
            rewardsSecondary:
            {
                name: farm?.poolDualRewardToken,
                amountDay: farm?.poolDualRewardPerDay

            },
            tvl: farmPool?.farmTVL,
            apr: apyFarm
        }

    } else {
        objectOut = {
            lptokenAddress: LpTokenAddress,
            isSSLpToken: isStableSwapLogic,
            token0: ammPool?.token0,
            token1: ammPool?.token1,
            rewards:
            {
                name: "RUBY",
                amountDay: farm?.poolRubyPerDay,
                allocPoint: farm?.poolShare * 1000,
                allocPercent: farm?.poolShare * 100
            },
            rewardsSecondary:
            {
                name: farm?.poolDualRewardToken,
                amountDay: farm?.poolDualRewardPerDay

            },
            tvl: farmPool?.farmTVL,
            apr: apyFarm
        }
    }

    return objectOut;
}


async function run() {

    let lps, farms;

    const rubyPrice = await getRubyPrice();

    let sklUSDP = await getAMMData(rubyPrice, "0xADDf444E06B76044EAE278Bc725e27e61c3A5E38");
    let sklFARM = await getFarmData(rubyPrice, sklUSDP, "0xADDf444E06B76044EAE278Bc725e27e61c3A5E38");


    let btcUSDP = await getAMMData(rubyPrice, "0x9Ba6777451F57859da195EfC0fA3714ab79FDBC2");
    let btcFARM = await getFarmData(rubyPrice, btcUSDP, "0x9Ba6777451F57859da195EfC0fA3714ab79FDBC2");


    let ethUSDP = await getAMMData(rubyPrice, "0x15369d5E452614b26271a4796C3D63E7F549c12d");
    let ethFARM = await getFarmData(rubyPrice, ethUSDP, "0x15369d5E452614b26271a4796C3D63E7F549c12d");


    let rubyUSDP = await getAMMData(rubyPrice, "0xC13F81c54273a50f42B1280426d77F6494Cbcf58");
    let rubyFARM = await getFarmData(rubyPrice, rubyUSDP, "0xC13F81c54273a50f42B1280426d77F6494Cbcf58");


    let ssUSDP = await getAMMData(rubyPrice, "0x1534c2eE179B5c307031F8dEF90E66D0D8B72028");
    let ssFARM = await getFarmData(rubyPrice, ssUSDP, "0x1534c2eE179B5c307031F8dEF90E66D0D8B72028");


    lps = [sklUSDP, btcUSDP, ethUSDP, rubyUSDP, ssUSDP];
    farms = [sklFARM, btcFARM, ethFARM, rubyFARM, ssFARM];


    console.log("AMM:", lps);
    console.log("FARM:", farms);
}

run();
