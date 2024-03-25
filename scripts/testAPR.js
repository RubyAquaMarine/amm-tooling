const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewards = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const STABLE_LP_ADDRESS = "0x1534c2eE179B5c307031F8dEF90E66D0D8B72028";
const RUBY_LP_ADDRESS = "0xC13F81c54273a50f42B1280426d77F6494Cbcf58";
const CHEF_ADDRESS = config.amm.masterchef;
const STABLESWAP_ADDRESS = config.amm.fourPool;

async function isStableSwap(LpTokenAddress){
    if(LpTokenAddress == STABLE_LP_ADDRESS){
        return true;
    }
    return false;
}

async function testAPR(LpTokenAddress) {


    // get ruby price: required to calculate the USD Value of rewards from the pool
    const rubyPrice = await amm.getTokenPrice(RUBY_LP_ADDRESS, accountOrigin)
    console.log("rubyPrice: ", rubyPrice);
    if (rubyPrice == undefined || rubyPrice <= 0) {
        console.log("BUG IN RUBY PRICE")
        return;
    }

    let isStableSwapLogic = await isStableSwap(LpTokenAddress);

    let ammPool;
    if(isStableSwapLogic){
        ammPool = await amm.stableSwapTokenBalance(LpTokenAddress,STABLESWAP_ADDRESS, accountOrigin);
    }else{
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

    const farm = await rewards.findFarmPoolShare( LpTokenAddress, CHEF_ADDRESS, accountOrigin)
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
        poolDualRewardBalance: 0,
        poolDualRewardMintRate: 0
}
    */


    let rewardsinUSD = farm?.poolRubyPerYear * rubyPrice;
    let apyFarm = (rewardsinUSD / farmPool?.farmTVL) * 100;

    // todo 
        // add the dual Rewards ROI into the apy 

    const obejctOut = {
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


    return [ammPool,obejctOut];
}

async function run() {
/*
    let sklUSDP = await testAPR("0xADDf444E06B76044EAE278Bc725e27e61c3A5E38");
    console.log(sklUSDP);

    let btcUSDP = await testAPR("0x9Ba6777451F57859da195EfC0fA3714ab79FDBC2");
    console.log(btcUSDP);

    let ethUSDP = await testAPR("0x15369d5E452614b26271a4796C3D63E7F549c12d");
    console.log(ethUSDP);

    let rubyUSDP = await testAPR("0xC13F81c54273a50f42B1280426d77F6494Cbcf58");
    console.log(rubyUSDP);
*/
    let ssUSDP = await testAPR("0x1534c2eE179B5c307031F8dEF90E66D0D8B72028");
    console.log(ssUSDP);

}

run();
