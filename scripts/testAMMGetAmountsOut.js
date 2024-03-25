const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const routerABI = require('../abi/amm_router.json');// Uniswap AMM router
const nftABI = require('../abi/rubyNFTAdmin.json');// NFT 
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);
//--------------------------------------ADJUST-----------------------------------||
const routerAddress = config.amm.router;
const fromToken = config.assets.europa.BTC;
const swapAmount = '0.001';
//--------------------------------------ADJUST-----------------------------------||

async function checkAMMultiHop() {

    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);

    let factory = await routerContract.factory();//0xc2f4C9B69448D94da2623787bD552F12B6a91278'
    let nftAdmin = await routerContract.nftAdmin();
    console.log(" Debug AMM Router Contract: Factory Address: ", factory);

    const nftContract = new ethers.Contract(nftAdmin, nftABI, account);
    let fee = await nftContract.calculateAmmSwapFeeDeduction(account.address)
    console.log("DEBUG swapFee ", fee.toString()) // 997

    let decimalDigit = await fromContract.decimals();
    const weiAmount = ethers.utils.parseUnits(swapAmount, decimalDigit);

    // Multi Hop scenario within AMM router RUBY -> USDP -> ETH
    const price_try = await routerContract.getAmountsOut(weiAmount, [fromToken, config.assets.europa.USDP, config.assets.europa.ETH], fee);

    const outValueMultiHopOk = price_try[price_try.length - 1];
    console.log("Debug out (wei) : ", outValueMultiHopOk.toString());
    console.log("Debug out(human): ", ethers.utils.formatEther(outValueMultiHopOk));
};
async function getAmountsOut_MatchDCA() {

    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);

    let factory = await routerContract.factory();
    let nftAdmin = await routerContract.nftAdmin();
    console.log(" Debug AMM Router Contract: Factory Address: ", factory);

    const nftContract = new ethers.Contract(nftAdmin, nftABI, account);
    let fee = await nftContract.calculateAmmSwapFeeDeduction(account.address)
    console.log("DEBUG swapFee ", fee.toString()) // 997

    let decimalDigit = await fromContract.decimals();
    const weiAmount = ethers.utils.parseUnits(swapAmount, decimalDigit);

    // decimals for btc 
    console.log(" BTC ", decimalDigit);

    const price_try = await routerContract.getAmountsOut(weiAmount, [fromToken, config.assets.europa.USDP], fee);

    const outValueMultiHopOk = price_try[price_try.length - 1].mul(1000);
    console.log("Debug out (wei) : ", outValueMultiHopOk.toString());
    console.log("Debug out(human): ", ethers.utils.formatEther(outValueMultiHopOk));
};

async function run() {
    await getAmountsOut_MatchDCA();

}

run();

