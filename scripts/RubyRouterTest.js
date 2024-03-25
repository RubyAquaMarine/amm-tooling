// node scripts/RubyRouterTest.js
const ethers = require('ethers');
const trade = require('../ruby_modules/tradeRouter.js');
const config = require('../setConfig.json');
//-----------------------ADJUST---||
const rpcUrl = config.rpc.schain_Europa;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
//-------------------------------------ADJUST-----||
const privateKey = credentials.account.privateKeyTokenDeployer;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const SLIPPAGE = 100;

const AMOUNT_COIN = '1500';// swapCoinToAnyStable
const AMOUNT_STABLE = '0.000001';// swapStableToCoin

const USDP_ADDRESS = config.assets.europa.USDP;

const TOKEN_IN = config.assets.europa.BRAWL;

const TOKEN_OUT = config.assets.europa.SKL;

const STABLE_IN = config.assets.europa.USDC;

const ROUTER_ADDRESS = config.amm.router;
const RUBY_ROUTER_ADDRESS = config.amm.rubyRouter;

const STABLE_SWAP_ADDRESS = config.amm.fourPool;

const StableIndex = {
  USDP: 0,
  DAI: 1,
  USDC: 2,
  USDT: 3,
}


async function swap_RubyRouter() {

  // AMM(XYZ to USDP) and Stable Swap Route
 // await trade.swapCoinToAnyStable(AMOUNT_COIN, TOKEN_IN, StableIndex.USDP, StableIndex.USDC, ROUTER_ADDRESS, RUBY_ROUTER_ADDRESS, STABLE_SWAP_ADDRESS, USDP_ADDRESS, account, provider)
 // await trade.swapStableToCoin(AMOUNT_STABLE, STABLE_IN, TOKEN_OUT, StableIndex.USDC, ROUTER_ADDRESS, RUBY_ROUTER_ADDRESS, STABLE_SWAP_ADDRESS, USDP_ADDRESS, account, provider, SLIPPAGE)

  // AMM Route
  await trade.swapCoinToUSDP(AMOUNT_COIN, TOKEN_IN, ROUTER_ADDRESS, RUBY_ROUTER_ADDRESS, USDP_ADDRESS, account, provider, SLIPPAGE);
//  await trade.swapUSDPToCoin(AMOUNT_STABLE, TOKEN_OUT, ROUTER_ADDRESS, RUBY_ROUTER_ADDRESS, USDP_ADDRESS, account, provider, SLIPPAGE);

}

function run() {
  swap_RubyRouter();
}
run();
