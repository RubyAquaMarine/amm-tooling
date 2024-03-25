const ethers = require('ethers');
const axios = require('axios');
const pairABI = require('../abi/pair.json');
const erc20ABI = require('../abi/erc20.json');
const amm = require('../ruby_modules/amm.js');
const trade = require('../ruby_modules/tradeRouter.js');
const schainConfig = require('../schain_modules/transfers.js');
const schainUtils = require('../schain_modules/utils.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);



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

// This code will not work for RUBYUSDP. need to seach for USDP BASE getAMMPools script
async function getPriceAMM(lpTokenAddress) {

    const account = accountOrigin;
    const poolContract = new ethers.Contract(lpTokenAddress, pairABI, account);
    let tokenA_Address = await poolContract.token0();
    let tokenB_Address = await poolContract.token1();
    let reserve = await poolContract.getReserves();

    const tokenA_Contract = new ethers.Contract(tokenA_Address, erc20ABI, account);
    const tokenB_Contract = new ethers.Contract(tokenB_Address, erc20ABI, account);

    // let tokenA_Symbol = await tokenA_Contract.symbol();
    // let tokenB_Symbol = await tokenB_Contract.symbol();

    let aDecimal = await tokenA_Contract.decimals();
    let bDecimal = await tokenB_Contract.decimals();

    // normalize the data based on the decimal digits
    let normA = ethers.utils.formatUnits(reserve[0], aDecimal)
    let normB = ethers.utils.formatUnits(reserve[1], bDecimal);

    const ammPrice = normA / normB;
    console.log(
        "---------------"
        + "\nReserves : " + reserve[0] + " | " + reserve[1]
        + "\nReserves : " + normA.toString() + " | " + normB.toString()
        + "\nPOOL PRICE : " + ammPrice + " USDP BASE ONLY "
    );

    return ammPrice;


}

// get price 
async function runETHUSDP() {
    const currentDate = new Date()
    console.log("TIME: ", currentDate)
    const amm = await getPriceAMM('0x15369d5E452614b26271a4796C3D63E7F549c12d');
    const cex = await getPriceBinance('ETHUSDT')
    const res = await compareETHUSDP(amm, cex)
    console.log(res)
}
async function runSKLUSDP() {
    const currentDate = new Date()
    console.log("TIME: ", currentDate)
    const amm = await getPriceAMM('0xADDf444E06B76044EAE278Bc725e27e61c3A5E38');
    const cex = await getPriceBinance('SKLUSDT')
    const res = await compareSKLUSDP(amm, cex)
    console.log(res)
}
async function runBTCUSDP() {
    const currentDate = new Date()
    console.log("TIME: ", currentDate)
    const amm = await getPriceAMM('0x9Ba6777451F57859da195EfC0fA3714ab79FDBC2');
    const cex = await getPriceBinance('BTCUSDT')
    const res = await compareBTCUSDP(amm, cex)
    console.log(res)
}

// buy or sell 
async function compareETHUSDP(ammPrice, cexPrice) {

    let sellOnAMM = false;
    let buyOnAMM = false;

    console.log("AMM", ammPrice)
    console.log("CEX", cexPrice)


    // normalize and compare
    if (cexPrice < ammPrice) {
        // sell on amm 
        sellOnAMM = true;
        // make swap

    }
    if (cexPrice > ammPrice) {
        // buy on amm
        buyOnAMM = true;
        // make swap
    }

    if (buyOnAMM) {

        let res = await trade.swapUSDPToCoin('1.0',
            config.assets.europa.ETH,
            config.amm.router,
            config.amm.rubyRouter,
            config.assets.europa.USDP,
            accountOrigin, providerOrigin,
            100)

        console.log(res);
    }

    if (sellOnAMM) {

        let res = await trade.swapCoinToUSDP('0.001',
            config.assets.europa.ETH,
            config.amm.router,
            config.amm.rubyRouter,
            config.assets.europa.USDP,
            accountOrigin, providerOrigin,
            100)

        console.log(res);
    }

    return "COMPARE ETHUSDP COMPLETE"
}

async function compareSKLUSDP(ammPrice, cexPrice) {

    let sellOnAMM = false;
    let buyOnAMM = false;

    console.log("AMM", ammPrice)
    console.log("CEX", cexPrice)


    // normalize and compare
    if (cexPrice < ammPrice) {
        // sell on amm 
        sellOnAMM = true;
        // make swap

    }
    if (cexPrice > ammPrice) {
        // buy on amm
        buyOnAMM = true;
        // make swap
    }

    if (buyOnAMM) {

        let res = await trade.swapUSDPToCoin('2.0',
            config.assets.europa.SKL,
            config.amm.router,
            config.amm.rubyRouter,
            config.assets.europa.USDP,
            accountOrigin, providerOrigin,
            100)

        console.log(res);



    }
    if (sellOnAMM) {

        let res = await trade.swapCoinToUSDP('40.0',
            config.assets.europa.SKL,
            config.amm.router,
            config.amm.rubyRouter,
            config.assets.europa.USDP,
            accountOrigin, providerOrigin,
            100)

        console.log(res);


    }
    return "COMPARE SKLUSDP COMPLETE"
}

// 2 USD BUY SELL
async function compareBTCUSDP(ammPrice, cexPrice) {

    let sellOnAMM = false;
    let buyOnAMM = false;

    console.log("AMM", ammPrice)
    console.log("CEX", cexPrice)


    // normalize and compare
    if (cexPrice < ammPrice) {
        // sell on amm 
        sellOnAMM = true;
        // make swap

    }
    if (cexPrice > ammPrice) {
        // buy on amm
        buyOnAMM = true;
        // make swap
    }

    if (buyOnAMM) {

        let res = await trade.swapUSDPToCoin('2.0',
            config.assets.europa.BTC,
            config.amm.router,
            config.amm.rubyRouter,
            config.assets.europa.USDP,
            accountOrigin, providerOrigin,
            100)

        console.log(res);
    }

    if (sellOnAMM) {

        let res = await trade.swapCoinToUSDP('0.0001',
            config.assets.europa.BTC,
            config.amm.router,
            config.amm.rubyRouter,
            config.assets.europa.USDP,
            accountOrigin, providerOrigin,
            100)

        console.log(res);
    }

    return "COMPARE ETHUSDP COMPLETE"
}

async function runBot() {
    //await runETHUSDP();
    //  console.log("NEXT")
      await runBTCUSDP();
    console.log("NEXT")
    //  await runSKLUSDP();
}

async function run() {

    setInterval(runBot, 10000 * 2)// 10 sec
    // setInterval(checkPrices,60000*10)// 10 mimute
}

run();


