const ethers = require('ethers');
const erc20ABI = require('./abi/erc20.json');
const routerABI = require('./abi/amm_router.json');
const pairABI = require('./abi/pair.json');
const factoryABI = require('./abi/factory.json');
const routerAddress = "0x7d18D7C457459148Ab1ad7423bCD7F2689B072a3";
const rpcUrl = "https://dappnet-api.skalenodes.com/v1/melodic-murzim";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');

const privateKey = credentials.account.privateKey;

const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);
const routerContract = new ethers.Contract(routerAddress, routerABI, account);
/*
ASSETS 
*/
const eth = "0xd2aaa00700000000000000000000000000000000";// CHANGED TO ETH
const ruby = "0x996d2c82B179D5CFF884d83E5bF54B3F1bdA6d71";// changed to LINK
const usdp = "0xdA5E2Ee40DE7b265C28B2028E6e1e568fa4Cf66e";
const usdc = "0x95bdEd8476bCe6dE791224d2663fb9259778c80c";
const usdt = "0x6D90AB0bB745B9a6CF8a7989f9fB38Bb7efC464d";
/*
router contact is quite useful , lets do some tests, 
const price_try = await routerContract.getAmountsOut(weiAmount, [fromToken, toToken]);
*/
let RubyPrice;
let EthPrice;
async function runTest(tokenA, tokenB) {

    const factoryAddress = await routerContract.factory();
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    const pairContract = new ethers.Contract(pairAddress, pairABI, account);
    const pairReserves = await pairContract.getReserves();

    const fromContract = new ethers.Contract(tokenA, erc20ABI, account);
    const toContract = new ethers.Contract(tokenB, erc20ABI, account);

    const decimalDigitTokenA = await fromContract.decimals();
    const decimalDigitTokenB = await toContract.decimals();

    const symTokenA = await fromContract.symbol();
    const symTokenB = await toContract.symbol();

    //dang
    let pairA;
    let pairB;
    let priceBetter;
  
    if (symTokenB == "Ruby" && symTokenA == "ETHC" || symTokenA == "Ruby" && symTokenB == "ETHC") {
        pairA = pairReserves[1];//ruby
        console.log(symTokenA + "pairA 1: " + pairA);
        pairA = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA)
        console.log(symTokenB + "pairA 2: " + pairA);
        pairB = pairReserves[0];//eth
        pairB = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB)
        priceBetter = pairB * EthPrice/ pairA ;// Get the Ruby Price based on the price of ETH
    } else {
        pairA = pairReserves[1];//ruby
        pairB = pairReserves[0];//usd
        priceBetter = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB) / ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);
    }
    if (symTokenA == "USDC" && symTokenB == "Ruby" || symTokenB == "USDC" && symTokenA == "Ruby") {
        RubyPrice = priceBetter;
    }
    if (symTokenB == "USDC" && symTokenA == "ETHC") {
        EthPrice = priceBetter;
    }

    let stringThing = "-----------------------------------------------\n" +
        "Pair Address: " + pairAddress + "\n" +
        "Symbol: " + symTokenA + "-" + symTokenB + " Reserves[A]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[B]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter + "\n" +
        "EthPrice: " + EthPrice + "\n" +
        "RubyPrice: " + RubyPrice;

    console.log(stringThing);
}

async function run() {
    await runTest(ruby, usdp);
    await runTest(ruby, usdc);
    await runTest(ruby, usdt);
    await runTest(eth, usdc);
    await runTest(ruby, eth);
}

run();
