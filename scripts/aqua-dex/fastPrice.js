const ethers = require('ethers');
const axios = require('axios');
const erc20ABI = require("../../abi/erc20.json");
const pairABI = require('../../abi/pair.json');
const factoryABI = require('../../abi/factory.json');
const config = require("../../setConfig.json");
const credentials = require("../../keys.json");
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const wallet = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const account = wallet.connect(provider);


const factoryAddress = config["aqua-dex"].factory;

const AQUA_PRICE = 0.01;
/*
ASSETS 
-- only 18 decimal tokens , less api calls this way 
 -- changed : added other variations 
*/


async function getPriceWithStables(tokenA, tokenB) {

    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    const pairContract = new ethers.Contract(pairAddress, pairABI, account);
    const pairReserves = await pairContract.getReserves();

    const fromContract = new ethers.Contract(tokenA, erc20ABI, account);
    const toContract = new ethers.Contract(tokenB, erc20ABI, account);

    const decimalDigitTokenA = 18;
    const decimalDigitTokenB = 18;

    const symTokenA = await fromContract.symbol();
    const symTokenB = 'AQUA';

    const pairA = pairReserves[0];
    const pairB = pairReserves[1];

  const priceBetter = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA)   /  ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB)   ;
   

    let stringThing = "-----------------------------------------------\n" + 
   
        "Pair Address: " + pairAddress + "\n" +
        "symbol " + symTokenA +"-" + symTokenB +  " Reserves[1]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[0]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter;

    console.log(stringThing);
}

async function getPriceWithAQUA(tokenA, tokenB) {

    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    const pairContract = new ethers.Contract(pairAddress, pairABI, account);
    const pairReserves = await pairContract.getReserves();

    const fromContract = new ethers.Contract(tokenA, erc20ABI, account);
    const toContract = new ethers.Contract(tokenB, erc20ABI, account);

    const decimalDigitTokenA = 18;
    const decimalDigitTokenB = 18;

    const symTokenA = await fromContract.symbol();
    const symTokenB = 'AQUA';

        // switch 
    const pairA = pairReserves[1];//ruby
    const pairB = pairReserves[0];//usd

    // only works on stable pairs which is fine for ruby since all pairs are based in USD
    // doesn't work for uniswap linkusdt 
   // const priceBetter = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB) / ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);
   const priceBetter = (ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA)   /  ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB) ) * AQUA_PRICE ;
    // doesn't work for uniswap linkusdt 

    let stringThing = "-----------------------------------------------\n" + 
   
        "Pair Address: " + pairAddress + "\n" +
        "symbol " + symTokenA +"-" + symTokenB +  " Reserves[1]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[0]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter;

    console.log(stringThing);
}

async function getPriceBinance(symbolPair) {
    // make sure the symbol is in all capps 
    symbolPair = symbolPair.toUpperCase();
    let data;
    let ok = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: {
            symbol: symbolPair
        }
    }).then(res => {
        data = res.data['price'];
    }).catch(err => {
        console.log(err);
    })
    console.log("Binance: ", data);

    const priceNumber = Number(data)
    return priceNumber;
}
/*
 todo:  add new pools 
*/


async function run() {

    // FromToken toToken
    await getPriceWithStables(config.assets.europa.DAI, config.assets.europa.AQUA);

    await getPriceWithStables(config.assets.europa.USDT, config.assets.europa.AQUA);

    await getPriceWithStables(config.assets.europa.USDC, config.assets.europa.AQUA);

    await getPriceWithStables(config.assets.europa.USDP, config.assets.europa.AQUA);

    await getPriceWithAQUA(config.assets.europa.EXD, config.assets.europa.AQUA);

    await getPriceWithAQUA(config.assets.europa.ETH, config.assets.europa.AQUA);
    await getPriceBinance('ETHUSDT');

    await getPriceWithAQUA(config.assets.europa.SKL, config.assets.europa.AQUA);
    await getPriceBinance('SKLUSDT');

    await getPriceWithAQUA(config.assets.europa.BRAWL, config.assets.europa.AQUA);

    await getPriceWithAQUA(config.assets.europa.PROSPECT, config.assets.europa.AQUA);

    await getPriceWithAQUA(config.assets.europa.SKILL, config.assets.europa.AQUA);

    await getPriceWithAQUA(config.assets.europa.TGOLD, config.assets.europa.AQUA);

    await getPriceWithAQUA(config.assets.europa.BTC, config.assets.europa.AQUA);


}

run();
