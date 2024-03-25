const ethers = require('ethers');
const amm = require('../../ruby_modules/amm.js');
const rewards = require('../../ruby_modules/rewarder.js');
const trade = require('../../ruby_modules/tradeRouter.js');
const schainConfig = require('../../schain_modules/transfers.js');
const schainUtils = require('../../schain_modules/utils.js');

const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
const CONSTANTS = require('../../Constants.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(CONSTANTS.project.rpc);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

/*

    Adds liquidity to ruby usdp pool 

    swaps assets 

    sends sfuel 


*/

const CHEF_ADDRESS = CONSTANTS.project.masterchef;
const SS_ADDRESS = CONSTANTS.project.fourPool;
const POOLS = CONSTANTS.data.length;// AMM POOL LENGTH
const STAKER = CONSTANTS.project.stake;
const ROUTER = CONSTANTS.project.router;
const RUBY_ROUTER = CONSTANTS.project.rubyRouter;

const StableIndex = {
    USDP: 0,
    DAI: 1,
    USDC: 2,
    USDT: 3,
}


// adjusts for mainnet and testnet RUBYUSDP USDPRUBY pairing
let RUBY_ADDRESS;
let USDP_ADDRESS;
function getCorrectSymbolMapping() {
    if (CONSTANTS.data[0].token0symbol == 'USDP') {
        USDP_ADDRESS = CONSTANTS.data[0].token0address;
        RUBY_ADDRESS = CONSTANTS.data[0].token1address;
    } else if (CONSTANTS.data[0].token1symbol == 'USDP') {
        USDP_ADDRESS = CONSTANTS.data[0].token1address;
        RUBY_ADDRESS = CONSTANTS.data[0].token0address;
    }
}

async function enter() {

    getCorrectSymbolMapping();

    console.log("RUBY", RUBY_ADDRESS)
    console.log("USDP", USDP_ADDRESS)

    //  0. check sfuel 
    await schainUtils.sendFUEL("0.000000000000000001", accountOrigin.address, accountOrigin, providerOrigin).then(res => {
        return res;
    }).catch(err => {
        console.log("Error: sendFUEL", err);
    })

    await amm.removeAMMLPToken(
        USDP_ADDRESS,
        RUBY_ADDRESS,
        ROUTER,
        accountOrigin,
        providerOrigin
    ).then(res => {
        return res;
    }).catch(err => {
        console.log("Error: sendFUEL", err);
    })

   
    //  1. swap (purely testing)
    await trade.swapCoinToAnyStable(
        "10",   // there are several bugs here : if 1*10**18 output of USDT,USDC fail from 6 decimal. another error is when Ruby < 1 USDP , can't sell 1*10**17 of RUBY because is less than 1*10**18 USDP 
        RUBY_ADDRESS,
        StableIndex.USDP,               //this is always USDP because its the base asset of the 
        StableIndex.USDC,               // stable token out
        ROUTER,
        RUBY_ROUTER,
        SS_ADDRESS,
        USDP_ADDRESS,
        accountOrigin,
        providerOrigin
    ).then(res => {
        return res;
    }).catch(err => {
        console.log("Error: swapCoinToAnyStable", err);
    })


    // required for LP add 
    await trade.swapCoinToUSDP(
        "0.1",
        RUBY_ADDRESS,         // token In
        ROUTER,                              // Harcode . dont change
        RUBY_ROUTER,                          // Harcode . dont change
        USDP_ADDRESS,         // Harcode . dont change
        accountOrigin,
        providerOrigin,
        100             // 100 is 1% slippage, 50 = 2 ,  25 = 4, 20 = 5, 10 = 10 , 5 = 20, etc 
    ).then(res => {
        return res;
    }).catch(err => {
        console.log("Error: swapCoinToUSDP", err);
    })

    //  2. add lp 
    await amm.addAssetsToAMMPool(
        50,   // 100 is 1% balanceOf, 50 = 2 ,  25 = 4, 20 = 5, 10 = 10 , 5 = 20, etc 
        RUBY_ADDRESS,
        USDP_ADDRESS,
        ROUTER,
        accountOrigin,
        providerOrigin
    ).then(res => {
        return res;
    }).catch(err => {
        console.log("Error: addAssetsToAMMPool", err);
    })

}


async function L2_sendSfuelTo(addressDest) {
    let res = await schainUtils.sendFUEL("0.0001", addressDest, accountOrigin, providerOrigin)
    console.log(res);
}

async function L2_removeLiquidityFromAMM() {
    let res = await amm.removeAMMLPToken("0x61352337d7Ed886AD840f884dF73dda1cC64cB71", config.assets.fancy.RUBY, config.ammv2.router, accountOrigin, providerOrigin)
    console.log(res);
}

// One tx will fail, and 1 tx will succeed 
// v1.1 : need to use the token with a lower balance as the input tokenA 
async function L2_addLiquidityToAMM(addPercent) {

    // check balances first, tokenA will be the tokenContract with less amount compared to TokenB (this ensures there's enough pairing_asset to make the addLiquidity a success)
    // Input token , token, routerAddress
    let res = await amm.addAssetsToAMMPool(addPercent, config.assets.fancy.ETH, config.assets.fancy.USDP, "0x7cC8CE65D5F3d7D417188fED0dBFE403FD956487", accountOrigin, providerOrigin)
    console.log(res);

    res = await amm.addAssetsToAMMPool(addPercent, config.assets.fancy.USDP, config.assets.fancy.ETH, "0x7cC8CE65D5F3d7D417188fED0dBFE403FD956487", accountOrigin, providerOrigin)
    console.log(res);
}

async function L1_exitCommunityPoolOn(schainDest) {
    let res = await schainUtils.exitCommunityPool(schainDest, accountOriginMainnet, providerMainnet)
    console.log(res);
}

async function L1_bridgeAssets(percentToSend, assetAddress, chainDestination) {
    //    await bridge.bridgeAssetstoSchain(10 sends 10% of balance,"token address","skale ima mainnet bridge address","Schain name", account, provider);
    let res = await schainUtils.bridgeAssetstoSchain(percentToSend, assetAddress, l1_depositBoxAddress, chainDestination, accountOriginMainnet, providerMainnet);
    console.log(res);
}

async function L1_gasTheWallets(sendETH) {
    //9   gasAnyUserWallet(transferAmount, walletAddress, skalePoolAddress, schain, accountSigner, rpcProvider) 
    let res = await schainUtils.gasAnyUserWallet(sendETH, accountOrigin.address, config.skale.community_pool, config.skale.europa, accountOriginMainnet, providerMainnet);
    console.log(res);

}



async function run() {



    await enter();


    // setInterval(launch, 60000 * 5)// 10 minutes
    // setInterval(launch, 10000 * 2)// 20 secs
}

run();