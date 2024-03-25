const ethers = require('ethers');
const amm = require('../../ruby_modules/amm.js');
const rewards = require('../../ruby_modules/rewarder.js');
const trade = require('../../ruby_modules/tradeRouter.js');
const schainConfig = require('../../schain_modules/transfers.js');
const schainUtils = require('../../schain_modules/utils.js');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const providerTarget = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);  // SKALE CHAIN
const providerMainnet = new ethers.providers.JsonRpcProvider(config.rpc.l1);   // RINKEBY ATM L1 RPC


const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const walletTarget = new ethers.Wallet(credentials.account.privateKey);

const accountOrigin = walletOrigin.connect(providerOrigin);
const accountOriginTarget = walletOrigin.connect(providerTarget);
const accountOriginMainnet = walletOrigin.connect(providerMainnet);

const accountTarget = walletTarget.connect(providerTarget);
const accountTargetOrigin = walletTarget.connect(providerOrigin);
const accountTargetMainnet = walletTarget.connect(providerMainnet);

const l1_depositBoxAddress = config.skale.deposit_box;



//----------------- LETS LAUNCH TOGETHER -----------------//
/*     requirements: chain rpc url , pkey with L1 funds 
1: bridge usdt to l2 - done
2: swap usdt to usdp to ruby - done swapB()
3: buy 50% usdp with usdt (stableSwap)
4: add LP RUBYUSDP - done: addLiquidityToAMM()
5: farm LP 
6: Vesting or claim(take 50% penalty)
7: stake rewards for penalty fees
8: buy lottery tickets 
9: gasWallet(ETH on L1) to exit L2 to L1 assets - done
    9a: exit LP - done: removeLiquidityFromAMM()
10: sell ruby, buy stable
11: bridge stable to l1
12: getEth from gasWallet (exit eth) - done: exitCommunityPoolOn()
*/

async function exitCommunityPoolOn(schainDest) {
    let res = await schainUtils.exitCommunityPool(schainDest, accountOriginMainnet, providerMainnet)
    console.log(res);
}

async function sendSfuelTo(addressDest) {
    let res = await schainUtils.sendFUEL("0.0001", addressDest, accountOrigin, providerOrigin)
    console.log(res);
}

async function removeLiquidityFromAMM() {
    let res = await amm.removeAMMLPToken("0x61352337d7Ed886AD840f884dF73dda1cC64cB71", config.assets.fancy.RUBY, config.ammv2.router, accountOrigin, providerOrigin)
    console.log(res);
}

// One tx will fail, and 1 tx will succeed 
// v1.1 : need to use the token with a lower balance as the input tokenA 
async function addLiquidityToAMM(addPercent) {

    // check balances first, tokenA will be the tokenContract with less amount compared to TokenB (this ensures there's enough pairing_asset to make the addLiquidity a success)
    // Input token , token, routerAddress
    let res = await amm.addAssetsToAMMPool(addPercent, config.assets.fancy.ETH, config.assets.fancy.USDP, "0x7cC8CE65D5F3d7D417188fED0dBFE403FD956487", accountOrigin, providerOrigin)
    console.log(res);

    res = await amm.addAssetsToAMMPool(addPercent, config.assets.fancy.USDP, config.assets.fancy.ETH, "0x7cC8CE65D5F3d7D417188fED0dBFE403FD956487", accountOrigin, providerOrigin)
    console.log(res);
}

async function bridgeAssets(percentToSend, assetAddress, chainDestination) {
    //    await bridge.bridgeAssetstoSchain(10 sends 10% of balance,"token address","skale ima mainnet bridge address","Schain name", account, provider);
    let res = await schainUtils.bridgeAssetstoSchain(percentToSend, assetAddress, l1_depositBoxAddress, chainDestination, accountOriginMainnet, providerMainnet);
    console.log(res);
}

async function gasTheWallets(sendETH) {
    //9   gasAnyUserWallet(transferAmount, walletAddress, skalePoolAddress, schain, accountSigner, rpcProvider) 
    let res = await schainUtils.gasAnyUserWallet(sendETH, accountOrigin.address, config.skale.community_pool, config.skale.europa, accountOriginMainnet, providerMainnet);
    console.log(res);

}

const StableIndex = {
    USDP: 0,
    DAI: 1,
    USDC: 2,
    USDT: 3,
}

// RUBY to any stable (USDC)
async function swap(account, provider) {
    //2     swapCoinToAnyStable(transferAmount,tokenInAddress,stableInIndex, stableOutIndex,routerAddress routerRubyAddress,routerStableAddress,USDPAddress, accountSigner,rpcProvider) 
    let res = await trade.swapCoinToAnyStable(
        "0.1",
        config.assets.europa.RUBY,
        StableIndex.USDP,
        StableIndex.USDC,               // stable token out
        config.amm.router,
        config.amm.rubyRouter,
        config.amm.fourPool,
        config.assets.europa.USDP,
        account,
        provider
    );
    console.log(res);

}

async function swapB(account, provider) {
    // swapStableToCoin(transferAmount, tokenInAddress, tokenOutAddress, stableInIndex, routerAddress, routerRubyAddress, routerStableAddress, USDPAddress, accountSigner, rpcProvider) {
    let res = await trade.swapStableToCoin(
        "1",
        config.assets.europa.USDC,         // token In
        config.assets.europa.RUBY,         // token Out
        StableIndex.USDT,                               // StableIndex must be correct 
        config.amm.router,                              // Harcode . dont change
        config.amm.rubyRouter,                          // Harcode . dont change
        config.amm.fourPool,                          // Harcode . dont change
        config.assets.europa.USDP,         // Harcode . dont change
        account,
        provider,
        100
    );
}

async function swapC(account, provider) {
    let res = await trade.swapCoinToUSDP(
        "200",
        config.assets.europa.RUBY,         // token In
        config.amm.router,                              // Harcode . dont change
        config.amm.rubyRouter,                          // Harcode . dont change
        config.assets.europa.USDP,         // Harcode . dont change
        account,
        provider,
        100             // 100 is 1% slippage, 50 = 2 ,  25 = 4, 20 = 5, 10 = 10 , 5 = 20, etc 
    );
}

// Testing s2s whitelisting and transfers (configuration of chain names and assets)
//whispering
async function configSchainOrigin() {

    await schainConfig.initTransfers(
        '1',                                   //  minting or transfer amount
        false, l1_depositBoxAddress,   // l1token address to whitelist
        tokenOrigin,   // origin token in
        tokenTarget,   // target token out

        'whispering-turais',                             // schain origin
        'fancy-rasalhague',                             // schain target
        accountOrigin, accountOriginTarget, accountOriginMainnet, providerOrigin
    )

}
//Fancy
async function configSchainTarget() {

    await schainConfig.initTransfers(
        '10000000',                                   // minting amount
        false, l1_depositBoxAddress,   // l1token address to whitelist
        tokenTarget,   //  token in
        tokenOrigin,   //  token out

        'fancy-rasalhague',                             // schain origin
        'whispering-turais',                             // schain target
        accountTarget, accountTargetOrigin, accountTargetMainnet, providerTarget
    )

}

// UNCOMMENT FUNCTIONS BELOW 
// Order of operations (functions are listed in order of execution if 'await' exists)

async function launch() {
    console.log("Start: ")

    //SFUEL 
    // await sendSfuelTo("0x8609E3D519756a7B15a6240e501e641AF25a0c2F")
    // await sendSfuelTo("0xD3331452080BE01A67fC04450e2d624e7B84cc0c")


    // BRIDGE L1 ASSETS
    // INPUT 
    //      - Percentage to Send
    //      - token address from mainnet
    // 1 = 100%
    // 10 = 10% of assets
    // 100 = 1 % of assets
    // await bridgeAssets(1000, config.assets.mainnet.USDT, config.skale.europa)          // send 1% of balanceOf to Europa
    //  await bridgeAssets(2, "0x5f138021271f0047863B6B7903052dC5A60EEfbe", config.skale.fancy)
    //  await bridgeAssets(2, "0x0Ac932FB9dB133DFf4ABB099d25E194d3ca90CB7", config.skale.fancy)

    // GAS UP WALLET TO FUND EXITS
    // await gasTheWallets("0.01")                               // Gas Up Community Pool with ETH to fund the Exits from Europa back to Mainnet


    // SWAP ASSETS 
    // COIN TO STABLE


    // STABLE TO COIN
    // await swapB(accountTarget, providerTarget)                         // swap USDT to RUBY


    // ADD LIQUIDITY TO AMM 
    //  await addLiquidityToAMM(1000)                                  // Adds 1% of token Balance as LP (for testing)

    // await removeLiquidityFromAMM()




    // SCHAIN OWNERS
    // Target Chain Setup
    //  await configSchainTarget()                              // rpc 2 fancy
    //  await schainConfig.prepareERC20(true)                  // MINTER_ROLE to tokenManager
    // await schainConfig.mintERC20()                          // MINTER_ROLE to admin key
    //  await schainConfig.prepareERC20(false)                  // switch back MINTER_ROLE to tokenManager


    // Origin Chain for Minting
    //  await configSchainOrigin()                              // rpc 1 whispering
    //  await schainConfig.prepareERC20(false)                   // MINTER_ROLE to tokenManager
    // await schainConfig.mintERC20()                          // MINTER_ROLE to admin key
    //  await schainConfig.prepareERC20(true)                   // switch back MINTER_ROLE to tokenManager



    //  await schainConfig.bridgeERC20()                        // Send from  origin to the target schain
    //  await schainConfig.bridgeBackERC20()                    // Send from  target chain back to the origin schain

    // await exitCommunityPoolOn(config.skale.europa)           // Removes ETH gas from mainnet wallet 




    // rewards ===============================================================

    // await rewards.ClaimFarmRewards(0, config.amm.masterchef, accountOrigin) // SKLUSDP POOL 
   // await rewards.ClaimFarmRewards(1, config.amm.masterchef, accountOrigin) // BTCUSDP
   // await rewards.ClaimFarmRewards(2, config.amm.masterchef, accountOrigin) // ETHUSDP
    // await rewards.ClaimFarmRewards(3, config.amm.masterchef, accountOrigin)// RUBYUSDP
    // await rewards.ClaimFarmRewards(4, config.amm.masterchef, accountOrigin)// 4Pool


    // Vesting (removes ruby from staking automatically)
   // await rewards.claimWithPenaltyAndUnlocked(config.amm.stake, accountOrigin)


    // restake: get token balance and stake everything 
   // let rubyAfter = await amm.checkTokenBalance(config.assets.europa.RUBY, accountOrigin.address, accountOrigin)
   // console.log(" My Ruby Balance: ", rubyAfter)


   // await rewards.stakeUnlockedRuby(rubyAfter, config.amm.stake, accountOrigin)


}

async function run() {
    //await launch();
    setInterval(launch, 60000 * 5)// 10 minutes
    // setInterval(launch, 10000 * 2)// 20 secs
}

run();