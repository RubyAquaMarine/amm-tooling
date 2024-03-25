const ethers = require('ethers');
const erc20ABI = require('./abi/erc20.json');
const pairABI = require('./abi/pair.json');
const factoryABI = require('./abi/factory.json');
const rpcUrl = "https://rinkeby-light.eth.linkpool.io";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');

const privateKey = credentials.account.privateKey;

const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
/*
ASSETS 
*/
const weth = "0xc778417E063141139Fce010982780140Aa0cD5Ab";// WETH
const usdt = "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02";// compound usdt ? 
const link = "0x01be23585060835e02b77ef475b0cc51aa1e0709";// official Link
const usdt_bybit = "0xd92e713d051c37ebb2561803a3b5fbabc4962431";

//0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8


async function runTest(tokenA, tokenB) {

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

    const pairA = pairReserves[1];//ruby
    const pairB = pairReserves[0];//usd

    // only works on stable pairs which is fine for ruby since all pairs are based in USD
    // doesn't work for uniswap linkusdt 
   // const priceBetter = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB) / ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);
   const priceBetter = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA)   /  ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB)   ;
    // doesn't work for uniswap linkusdt 

    let stringThing = "-----------------------------------------------\n" + 
    "Factory Address: " + factoryAddress + "\n" +
        "Pair Address: " + pairAddress + "\n" +
        "symbol " + symTokenA +"-" + symTokenB +  " Reserves[1]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[0]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter;

    console.log(stringThing);
}

function run() {
    // FromToken toToken
    runTest(usdt_bybit, link);
}

run();
