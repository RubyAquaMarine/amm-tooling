const axios = require('axios');
const ethers = require('ethers');
const routerABI = require('./abi/amm_router.json');
const erc20ABI = require('./abi/erc20.json');
const pairABI = require('./abi/pair.json');
const factoryABI = require('./abi/factory.json');
const credentials = require('./keys.json');
const privateKey = credentials.account.privateKey;

const rpcMainnet = "https://rinkeby-light.eth.linkpool.io";
const rpcSchain = "https://dappnet-api.skalenodes.com/v1/melodic-murzim";

const providerA = new ethers.providers.JsonRpcProvider(rpcMainnet);
const providerB = new ethers.providers.JsonRpcProvider(rpcSchain);

const walletA = new ethers.Wallet(privateKey);
const walletB = new ethers.Wallet(privateKey);

const accountMainnet = walletA.connect(providerA);
const accountSchain = walletB.connect(providerB);

const routerAddressMainnet = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const routerContractMainnet = new ethers.Contract(routerAddressMainnet, routerABI, accountMainnet);

const routerAddressSchain = "0x7d18D7C457459148Ab1ad7423bCD7F2689B072a3";
const routerContractSchain = new ethers.Contract(routerAddressSchain, routerABI, accountSchain);

//mainnet
const link = "0x01be23585060835e02b77ef475b0cc51aa1e0709";// official Link
const usdt_bybit = "0xd92e713d051c37ebb2561803a3b5fbabc4962431";

//schain
const link_s = "0x996d2c82B179D5CFF884d83E5bF54B3F1bdA6d71";
const usdt_s = "0x6D90AB0bB745B9a6CF8a7989f9fB38Bb7efC464d";// $19.96
const usdp_s = "0xdA5E2Ee40DE7b265C28B2028E6e1e568fa4Cf66e";// $18.32
const usdc_s = "0x95bdEd8476bCe6dE791224d2663fb9259778c80c";// $17.90

const hardCodeSymbol = "LINKUSDT";

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
    return data;
}


async function getPriceMainnet(tokenA, tokenB) {
    const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, accountMainnet);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    const pairContract = new ethers.Contract(pairAddress, pairABI, accountMainnet);
    const pairReserves = await pairContract.getReserves();

    const fromContract = new ethers.Contract(tokenA, erc20ABI, accountMainnet);
    const toContract = new ethers.Contract(tokenB, erc20ABI, accountMainnet);

    const decimalDigitTokenA = await fromContract.decimals();
    const decimalDigitTokenB = await toContract.decimals();

    const symTokenA = await fromContract.symbol();
    const symTokenB = await toContract.symbol();

    const pairA = pairReserves[1];
    const pairB = pairReserves[0];

    let reservesA = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);
    let reservesB = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB);

    const priceBetter = reservesA / reservesB;

    let stringThing = "-----------------------------------------------\n" +
        "Factory Address: " + factoryAddress + "\n" +
        "Pair Address: " + pairAddress + "\n" +
        "symbol " + symTokenA + "-" + symTokenB + " Reserves[1]: " + reservesA + " d: " + decimalDigitTokenA + " Reserves[0]: " + reservesB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter;

    console.log(stringThing);

    let returnArray = [];
    returnArray[0] = priceBetter;
    returnArray[1] = reservesA;
    returnArray[2] = reservesB;

    return returnArray;
}


async function getPriceSchain(tokenA, tokenB) {
    const factoryAddress = "0x622311A7E32f3dD209C86f5Fe522BcEdbbAbFB8c";
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, accountSchain);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    const pairContract = new ethers.Contract(pairAddress, pairABI, accountSchain);
    const pairReserves = await pairContract.getReserves();

    const fromContract = new ethers.Contract(tokenA, erc20ABI, accountSchain);
    const toContract = new ethers.Contract(tokenB, erc20ABI, accountSchain);

    const decimalDigitTokenA = await fromContract.decimals();
    const decimalDigitTokenB = await toContract.decimals();

    const symTokenA = await fromContract.symbol();
    const symTokenB = await toContract.symbol();

    const pairA = pairReserves[1];//ruby
    const pairB = pairReserves[0];//usd

    let reservesA = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);
    let reservesB = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB);

    // only works on stable pairs which is fine for ruby since all pairs are based in USD
    const priceBetter = reservesB / reservesA;

    // this works for uniswap linkusdt 
    //const priceBetter = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA)   /  ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB)   ;


    let stringThing = "-----------------------------------------------\n" +
        "Factory Address: " + factoryAddress + "\n" +
        "Pair Address: " + pairAddress + "\n" +
        "symbol " + symTokenA + "-" + symTokenB + " Reserves[1]: " + reservesA + " d: " + decimalDigitTokenA + " Reserves[0]: " + reservesB + " d:" + decimalDigitTokenB + "\n" +
        "Price: " + priceBetter;

    console.log(stringThing);


    let returnArray = [];
    returnArray[0] = priceBetter;
    returnArray[1] = reservesA;
    returnArray[2] = reservesB;

    return returnArray;
}


async function mainnetApproval(swapAmount) {

    const weiAmount = ethers.utils.parseUnits(swapAmount, 'ether');

    let allowanceAmount = await fromContractMainnet.allowance(accountMainnet.address, routerAddressMainnet);

    console.log("Router Contract Allowance: " + allowanceAmount.toString(), allowanceAmount);

    if (allowanceAmount.toString() == "0" || weiAmount.toString() >= allowanceAmount.toString()) {

        console.log("Router Contract Needs Increased Allowance: ");

        const increase = weiAmount.mul(10);

        const parse = await fromContractMainnet.approve(routerAddressMainnet, increase);

        const receipt = await parse.wait();

        console.log("Router Contract Result: ", receipt);
    }
}

async function sChainApproval(swapAmount) {

    const weiAmount = ethers.utils.parseUnits(swapAmount, 'ether');

    let allowanceAmount = await fromContractSchain.allowance(accountSchain.address, routerAddressSchain);

    console.log("Router Contract Allowance: " + allowanceAmount.toString(), allowanceAmount);

    if (allowanceAmount.toString() == "0" || weiAmount.toString() >= allowanceAmount.toString()) {

        console.log("Router Contract Needs Increased Allowance: ");

        const increase = weiAmount.mul(10);

        const parse = await fromContractSchain.approve(routerAddressSchain, increase);

        const receipt = await parse.wait();

        console.log("Router Contract Result: ", receipt);
    }
}


async function mainnetSwap(fromToken, toToken, swapAmount) {

    const chechApprovalValue = await mainnetApproval(swapAmount);

    //Provider 
    const blockNumber = await providerA.getBlockNumber();

    const balance = await providerA.getBalance(accountMainnet.address);

    const gas_try = await providerA.getGasPrice();
    
    const try_string = gas_try.toString();

    const blockData = await providerA.getBlock(blockNumber);

    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

    console.log("BlockNumber: " + blockNumber + " Balance: " + balance + " GasPrice: " + gas_try.toString() + "\nExpires: " + expiryDate + " | Time: " + blockData.timestamp);

    //Signer 
    const address = await accountMainnet.getAddress();

    const nonce = await accountMainnet.getTransactionCount("latest");

    console.log("My Wallet Address: " + address + " TransactionCount: " + nonce);

    let decimalDigit = await fromContractMainnet.decimals();

    const weiAmount = ethers.utils.parseUnits(swapAmount, decimalDigit);

    console.log("AmountsINN: ", weiAmount.toString());

    const outAmounts = await routerContractMainnet.getAmountsOut(weiAmount, [fromToken, toToken]);

    let length = outAmounts.length;// number of swaps, routing unknown
    /*
    for (let i = 0; i < length; i++) {
    }
    */
    let arrayIndex = length -1;// last index
    
    const amountOutValue = ethers.BigNumber.from(outAmounts[arrayIndex]);//BigNumber Object

    //const amountOut = amountOutValue.sub(amountOutValue.div(10));// 10% slippage
    const amountOut = amountOutValue.sub(amountOutValue.div(200));// 0.5% slippage

    console.log("OUT (slippage Included): ", amountOut.toString());

    // ensure variables are BigNumber objects before testing math functions
    if( ethers.BigNumber.isBigNumber(amountOutValue) && ethers.BigNumber.isBigNumber(amountOut)  ){
        console.log("Maximum: " , amountOutValue.toString() );
        console.log("Minimum: " , amountOut.toString() );
        let slippageValue = amountOutValue.sub(amountOut);
        console.log("Slippage " , slippageValue.toString() );
    }

    let swap_tx = '';

    swap_tx = await routerContractMainnet.swapExactTokensForTokens(
        weiAmount,// amountIn
        amountOut,// amountOuMin
        [fromToken, toToken],
        accountMainnet.address,
        expiryDate,
        {
            "gasPrice": try_string,
            "gasLimit": "280000",
            "nonce": nonce
        }
    ).then(result => {
        // result is another promise =. deal with it 
        let out = result.wait().then(ok => {
           // console.log("Result: ", ok);
            console.log("Swap Completed");
        }).catch(err => {
            console.log("Result Error: ", err);
        });
    }).catch(err => {
        console.log("Processing Error: ", err);
    });
};

async function sChainSwap(fromToken, toToken, swapAmount) {

    const chechApprovalValue = await sChainApproval(swapAmount);

    //Provider 
    const blockNumber = await providerB.getBlockNumber();

    const balance = await providerB.getBalance(accountSchain.address);

    const gas_try = await providerB.getGasPrice();

    const blockData = await providerB.getBlock(blockNumber);

    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

    console.log(" BlockNumber: " + blockNumber + " Balance: " + balance + " GasPrice: " + gas_try.toString() + "\nExpires: " + expiryDate + " | Time: " + blockData.timestamp);

    //Signer 
    const address = await accountSchain.getAddress();

    const nonce = await accountSchain.getTransactionCount("latest");

    console.log(" My Wallet Address: " + address + " TransactionCount: " + nonce);

    let decimalDigit = await fromContractSchain.decimals();

    const originalAmount = swapAmount;

    // let try_new = ethers.utils.formatUnits(originalAmount, 6);// 1 turns into 0.000001

    const weiAmount = ethers.utils.parseUnits(originalAmount, decimalDigit);
    // const weiAmount = ethers.utils.parseUnits(originalAmount, 'ether');

    const price_try = await routerContractSchain.getAmountsOut(weiAmount, [fromToken, toToken]);

    const amountOut = price_try[1].sub(price_try[1].div(10));// 10% slippage

    let try_string = gas_try.toString();

    console.log("Schain AmountsINN: ", weiAmount.toString());
    console.log("Schain AmountsOUT: ", amountOut.toString());

    var swap_tx = '';

    swap_tx = await routerContractSchain.swapExactTokensForTokens(
        weiAmount,// amountIn
        amountOut,// amountOuMin
        [fromToken, toToken],
        accountSchain.address,
        expiryDate,

        {
            "gasPrice": try_string,
            "gasLimit": "280000",
            "nonce": nonce
        }

    ).then(result => {
        // result is another promise =. deal with it 
        let out = result.wait().then(ok => {
            console.log("Result: ", ok);
        }).catch(err => {
            console.log("Result Error: ", err);
        });
    }).catch(err => {
        console.log("Processing Error: ", err);
    });
};


async function run(mainTokenA, mainTokenB, sTokenA, sTokenB) {

    let cexA = await getPriceBinance(hardCodeSymbol);
    let ammA = await getPriceMainnet(mainTokenA, mainTokenB); // FromToken toToken
    let ammB = await getPriceSchain(sTokenA, sTokenB);// 
    

    let buyMainnet = false;
    let sellMainnet = false;
    let buySchain = false;
    let sellSchain = false;
    let tolerance = 0.015;// 1.5 % ( 0.6 swap fee and 0.9 in gas)
    if (ammA[0] - ammA[0] * tolerance > ammB[0] && cexA >= ammB) {
        console.log("Sell on Mainnet, Buy on Schain")
        sellMainnet = true;
        if (ammB[0] + ammB[0] * tolerance < cexA) {
            buySchain = true;
        }
    }
    if (ammB[0] - ammB[0] * tolerance > ammA[0] && cexA >= ammA[0]) {
        console.log("Buy on Mainnet")
        buyMainnet = true;
        if (ammB[0] - ammB[0] * tolerance > cexA) {
            console.log("Sell on Schain")
            sellSchain = true;
        }
    }

    // Make the swaps
    if (buyMainnet) {
        // from usd to link
        fromContractMainnet = new ethers.Contract(mainTokenA, erc20ABI, accountMainnet);
        mainnetSwap(mainTokenA, mainTokenB, '10.0');
    }
    if (sellMainnet) {
        // from link to usd
        fromContractMainnet = new ethers.Contract(mainTokenB, erc20ABI, accountMainnet);
        mainnetSwap(mainTokenB, mainTokenA, '0.1');
    }
    if (buySchain) {
        fromContractSchain = new ethers.Contract(sTokenB, erc20ABI, accountSchain);
        sChainSwap(sTokenB, sTokenA, '1.0');
    }
    if (sellSchain) {
        fromContractSchain = new ethers.Contract(sTokenA, erc20ABI, accountSchain);
        sChainSwap(sTokenA, sTokenB, '0.001');
    }


}

run(usdt_bybit, link, link_s, usdc_s);

/*
tofo list
    - figure out slippage,
    - figure out the position sizes , make sure the wallet balance has enough reserves to make the transaction including eth for gas

*/

/*
   swap fee to buy 0.30% + gas
   bridge gas to schain
   swap fee to sell 0.3% no gas
   bridge gas ( communityPool) back to mainnet

   0.6% in swap fees

   $1000 tx  $30 in gad = 3%
   $10000 tx $30 in gas = 0.3%
   3 gas ups required = 0.9%

   need to calculate the price Impact aka slippage as well. It would be best to todo these calculations within the getPrice() and return the variables
*/





