/*
 updated 
 - use chat command /mylp <addr>
 
*/

const telegram = require('node-telegram-bot-api');
const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewards = require('../ruby_modules/rewarder.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);
//--------------------------------------ADJUST-----------------------------------||
const token = config.telegram.token;
const CHEF_ADDRESS = config.amm.masterchef;
const STABLESWAP_ADDRESS = config.amm.fourPool;

//--------------------------------------ADJUST-----------------------------------||

const STABLE_LP_ADDRESS = "0x1534c2eE179B5c307031F8dEF90E66D0D8B72028";
const RUBY_LP_ADDRESS = "0xC13F81c54273a50f42B1280426d77F6494Cbcf58";
const ETH_LP_ADDRESS = "0x15369d5E452614b26271a4796C3D63E7F549c12d";
const BTC_LP_ADDRESS = "0x9Ba6777451F57859da195EfC0fA3714ab79FDBC2";
const SKL_LP_ADDRESS = "0xADDf444E06B76044EAE278Bc725e27e61c3A5E38";
//--------------------------------------ADJUST-----------------------------------||
// Bot runs commands based on user input.  rpc calls are slow, user needs to call to update the data first, 
// then call for that updated data ( this will ensure the data is returned to the user quickly without any lag)
// save all data into these variables
let rubyusdpPrice;

let amm_ruby_rubyusd;
let farm_ruby_rubyusd;

let amm_ruby_btcusd;
let farm_ruby_btcusd;

let amm_ruby_ethusd;
let farm_ruby_ethusd;

let amm_ruby_ss;
let farm_ruby_ss;

let amm_ruby_sklusd;
let farm_ruby_sklusd;

const bot = new telegram(token, { polling: true });

async function isStableSwap(LpTokenAddress) {
    if (LpTokenAddress == STABLE_LP_ADDRESS) {
        return true;
    }
    return false;
}

// updates the external variable and returns the price for other functions to call this value
async function getRubyPrice() {
    const rubyPrice = await amm.getTokenPrice(RUBY_LP_ADDRESS, accountOrigin)
    if (rubyPrice == undefined || rubyPrice <= 0) {
        console.log("BUG IN RUBY PRICE", rubyPrice)
        return 0;
    }
    rubyusdpPrice = rubyPrice;
    console.log("RUBY PRICE: ", rubyusdpPrice)
    return rubyPrice;
}


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

    return ammPool;
}

// ss returns / or any pool within dual rewards will return undefined. fix that
// add  aprDualRewards: apyFarmDR
async function getFarmData(ruby, ammObject, LpTokenAddress) {
    // console.log("getFarmData function inputs are: ", ruby, ammObject,LpTokenAddress)
    const rubyPrice = ruby;
    if (rubyPrice == undefined || rubyPrice <= 0) {
        console.log("BUG IN RUBY PRICE")
        return "error in get farm data funciton";
    }

    let isStableSwapLogic = ammObject?.isSS;
    let ammPool = ammObject;
    const tvlAMM = ammPool?.tvl;


    const farmPool = await rewards.getFarmTVL(tvlAMM, LpTokenAddress, CHEF_ADDRESS, accountOrigin)
    // console.log("get FARM TVL (): ", farmPool)
    /*
        totalSupply: 717248.4249161883,
        lpTokenPrice: 0.9741124401997053,
        ammTVL: 698680.6134245034,
        farmTVL: 39780.26873095897
    */

    const farm = await rewards.findFarmPoolShare(LpTokenAddress, CHEF_ADDRESS, accountOrigin)
    //  console.log("testFarmRewards: ", farm)
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
    let apyFarmDR = 0;
    let apyTotal = apyFarm;
    let getTokenPrice;
    let ifDualReward = farm?.poolDualRewardTokenAddress;


    if (ifDualReward) {

        getTokenPrice = await amm.getTokenPriceFromSymbol(ifDualReward, accountOrigin);

        let testDR = farm?.poolDualRewardPerYear;
        if (testDR == 0) {
            testDR = 1;// prevent zero divide while rewards are off
        }
        let rewardsinUSDonDR = testDR * getTokenPrice;
        apyFarmDR = (rewardsinUSDonDR / farmPool?.farmTVL) * 100;
        console.log("apyFarmDR", apyFarmDR)
        console.log("rewardsinUSDonDR", rewardsinUSDonDR)
        console.log("getDualRewardTokenPrice ", getTokenPrice)
        apyTotal = apyFarm + apyFarmDR;
    } else {
        console.log("No Dual Rewards on this Pool")
    }


    let objectOut;
    let dualRewardTokenExist;
    let dualRewardTokenAmount;

    if (!farm?.poolDualRewardToken) {
        dualRewardTokenExist = "RUBY";// FIX LATER BUG
        dualRewardTokenAmount = 0;
    } else {
        dualRewardTokenExist = farm?.poolDualRewardToken;
        dualRewardTokenAmount = farm?.poolDualRewardPerDay;
    }

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
                name: dualRewardTokenExist,
                amountDay: dualRewardTokenAmount

            },
            tvl: farmPool?.farmTVL,
            apr: apyFarm,
            aprDualRewards: apyFarmDR,
            aprTotal: apyTotal
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
            apr: apyFarm,
            aprDualRewards: apyFarmDR,
            aprTotal: apyTotal
        }
    }

    if (objectOut.apr) {
        return objectOut;
    } else {
        return "error in get farm data funciton";
    }
}

// match up the pool_data object 
// edit here when New pools are added to RUBY.EXCHANGE
let dataSyncReady = false;
async function dataSync() {

    console.log("DataSync Started:")
    dataSyncReady = false;
    let rubyPrice = await getRubyPrice();

    //-- pool 
    let rubyusdp = await updatePoolData(rubyPrice, RUBY_LP_ADDRESS);
    amm_ruby_rubyusd = rubyusdp[0];
    farm_ruby_rubyusd = rubyusdp[1];
    //-- pool 
    let btcusdp = await updatePoolData(rubyPrice, BTC_LP_ADDRESS);
    amm_ruby_btcusd = btcusdp[0];
    farm_ruby_btcusd = btcusdp[1];
    //-- pool 
    let ethusdp = await updatePoolData(rubyPrice, ETH_LP_ADDRESS);
    amm_ruby_ethusd = ethusdp[0];
    farm_ruby_ethusd = ethusdp[1];
    //-- pool 
    let skl = await updatePoolData(rubyPrice, SKL_LP_ADDRESS);
    amm_ruby_sklusd = skl[0];
    farm_ruby_sklusd = skl[1];
    //-- pool 
    let ss = await updatePoolData(rubyPrice, STABLE_LP_ADDRESS);
    amm_ruby_ss = ss[0];
    farm_ruby_ss = ss[1];


    console.log("DataSync Finished (SHOW Stable Swap Data): ", amm_ruby_ss, farm_ruby_ss)
    dataSyncReady = true;
}

// this returns both the amm and farm pool data 
// output: [amm,farm]
async function updatePoolData(rubyusdpPrice, lpTokenAddress) {
    try {
        let amm = await getAMMData(rubyusdpPrice, lpTokenAddress)
        let farm = await getFarmData(rubyusdpPrice, amm, lpTokenAddress)
        return [amm, farm]
    } catch (e) {
        return 'error in updatePoolData function'
    }
}
// true/false boolean to allow converting of lp tokens ( if we want to disable)
async function convertLPTokens(pair) {

    pair = pair.toUpperCase();

    if (pair == "ETH") {
        let eth = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.ETH, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + eth;
    }
    if (pair == "RUBY") {
        let ruby = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.RUBY, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + ruby;
    }
    if (pair == "SKL") {
        let skl = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.SKL, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + skl;
    }
    if (pair == "BTC") {
        let btc = await rewards.convertLPtoRuby(true, config.assets.europa.USDP, config.assets.europa.BTC, config.amm.maker, accountOrigin, providerOrigin)
        return "LP Tokens converted" + btc;
    }
}

// telegram commands
bot.on('message', (msg) => {

    const chatId = msg.chat.id;
    console.log("New telegram message on chatId: ", chatId);

    if (msg.text == "/start") {
        dataSync();
        bot.sendMessage(chatId, "DEX Pool Data is being updated. Please wait");
        bot.sendMessage(chatId, "Commands:\n/price\n/apr\n/update (run this command daily to update the farm apr and tvl values)");
    }

    if (msg.text == "/update") {
        dataSync();
        bot.sendMessage(chatId, "DEX Pool Data is being updated. Please wait 1 minute per farm pool ");
    }

    if (msg.text == "/price") {
        getRubyPrice()// updates rubyusdpPrice
        bot.sendMessage(chatId, rubyusdpPrice);
    }

    if (msg.text == "/compare" || msg.text == "/COMPARE") {

        let mess =
            "Create New Message"

        bot.sendMessage(chatId, mess);
    }

    if (msg.text == "/apr") {
        // return not ready, please wait longer for calculations 
        if (!dataSyncReady) {
            const messageTo = "Please try again later. Data is being calculated...."
            bot.sendMessage(chatId, messageTo);
            return;
        }

        // create the message text for telegram
        const rubyusdPool = helpAssembly(amm_ruby_rubyusd, farm_ruby_rubyusd);
        const btcusdPool = helpAssembly(amm_ruby_btcusd, farm_ruby_btcusd)
        const ethPool = helpAssembly(amm_ruby_ethusd, farm_ruby_ethusd)
        const sklPool = helpAssembly(amm_ruby_sklusd, farm_ruby_sklusd)
        const ssPool = helpAssembly(amm_ruby_ss, farm_ruby_ss)

        // concat strings
        // 
        const makeObjectForTG = rubyusdPool + "\n\n" + btcusdPool + "\n\n" + ethPool + "\n\n" + sklPool + "\n\n" + ssPool;

        //send 
        bot.sendMessage(chatId, makeObjectForTG);

    }

    let stringTest = msg.text;
    let pair = stringTest.slice(8);//save 
    stringTest = stringTest.substr(0, 8);
    if (stringTest == "/convert" && pair.length >= 3) {
        convertLPTokens(pair);
        bot.sendMessage(chatId, "Converting LP tokens on Pool:" + pair + "-USDP");
    }
    if (msg.text == "/convertLP") {

        bot.sendMessage(chatId, "run the command with the Asset Name after /convert such as /convertRUBY");
    }

    // get the users LP token value
    let stringlp = msg.text;
    stringlp = stringlp.substr(0, 5);
    if (stringlp == "/mylp") {
        // /mylp userAddress
        var coolVar = msg.text;
        var partsArray = coolVar.split(' ');
        let checkLength = partsArray.length;
        if (checkLength == 2) {
            let messageObject = "Your LP Tokens are worth\n";
            console.log("#384 - amm value of ruby lp pool,", amm_ruby_rubyusd)
            let test_ruby_LP = rewards.getLPTokenValue(amm_ruby_rubyusd.tvl, RUBY_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                console.log("", result)
                messageObject = "RUBYUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_btc_LP = rewards.getLPTokenValue(amm_ruby_btcusd.tvl, BTC_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "BTCUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_eth_LP = rewards.getLPTokenValue(amm_ruby_ethusd.tvl, ETH_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "ETHUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_skl_LP = rewards.getLPTokenValue(amm_ruby_sklusd.tvl, SKL_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "SKLUSDP: " + result.userTVL + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
            let test_ss_LP = rewards.getLPTokenValue(amm_ruby_ss, STABLE_LP_ADDRESS, partsArray[1], accountOrigin).then(result => {
                messageObject = "4POOL: " + result.userSupply + "\n";
                bot.sendMessage(chatId, messageObject);
            }).catch(err => {
                console.log("ERROR on user LP", err)

            })
        }

    }

    console.log("End Telegram message");
});

// format data for telegram message
function helpAssembly(amm, farm) {

    let pool_price;
    let pool_name;
    const dashStr = "-";
    // ss doesn't have token.price 
    let fourPoolName = "";
    if (amm?.token0.price == undefined) {
        pool_price = 1.0;
        fourPoolName = "4Pool: ";
        pool_name = amm?.token0.symbol + dashStr + amm?.token1.symbol + dashStr + amm?.token2.symbol + dashStr + amm?.token3.symbol;
    } else if (amm?.token0.price == 1) {   // tokenA is USDP, use tokenB price for the pool_price
        pool_price = amm?.token1.price.toFixed(4);
        pool_name = amm?.token1.symbol + dashStr + amm?.token0.symbol;
    } else {
        pool_price = amm?.token0.price.toFixed(4);
        pool_name = amm?.token0.symbol + dashStr + amm?.token1.symbol;
    }

    const makeObjectForTG = fourPoolName + pool_name + "(" + pool_price + ")" + "\n" +
        "AMM TVL: " + amm?.tvl.toFixed(2) + "\n" +
        "FARM TVL: " + farm?.tvl.toFixed(2) + "\n" +
        "APR BASE: " + farm?.apr.toFixed(2) + "%\n" +
        "APR DUAL REWARD: " + farm?.aprDualRewards.toFixed(2) + "%\n" +
        "APR TOTAL: " + farm?.aprTotal.toFixed(2) + "%\n" +
        "REWARDS: " + farm?.rewards.name + " & " + farm?.rewardsSecondary.name

    return makeObjectForTG;

}
