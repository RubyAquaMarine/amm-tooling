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
link 0x996d2c82B179D5CFF884d83E5bF54B3F1bdA6d71
*/
const ruby = "0x996d2c82B179D5CFF884d83E5bF54B3F1bdA6d71";// CHANGED
const usdp = "0xdA5E2Ee40DE7b265C28B2028E6e1e568fa4Cf66e";
const usdc = "0x95bdEd8476bCe6dE791224d2663fb9259778c80c";
const usdt = "0x6D90AB0bB745B9a6CF8a7989f9fB38Bb7efC464d";
/*
router contact is quite useful , lets do some tests, 
const price_try = await routerContract.getAmountsOut(weiAmount, [fromToken, toToken]);
*/
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
    if (symTokenB == "USDP" && symTokenA == "ETHC") {
        pairA = pairReserves[0];//usdp
        pairB = pairReserves[1];//eth

    } else {
        pairA = pairReserves[1];//ruby
        pairB = pairReserves[0];//usd
    }

    // only works on stable pairs which is fine for ruby since all pairs are based in USD
    const priceBetter = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB) / ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);

    let stringThing = "-----------------------------------------------\n" +
        "Factory Address: " + factoryAddress + "\n" +
        "Pair Address: " + pairAddress + "\n" +
        "symbol " + symTokenA + "-" + symTokenB + " Reserves[1]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[0]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter;

    console.log(stringThing);
}

function run() {
    runTest(ruby, usdp);
    runTest(ruby, usdc);
    runTest(ruby, usdt);
}

run();
