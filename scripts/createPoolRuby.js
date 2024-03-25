const axios = require('axios');
const ethers = require('ethers');
const erc20ABI = require('./abi/erc20.json');
const routerABI = require('./abi/amm_router.json');
const routerAddress = "0x7d18D7C457459148Ab1ad7423bCD7F2689B072a3";
const rpcUrl = "https://dappnet-api.skalenodes.com/v1/melodic-murzim";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

// Use the RubyAdmin/ creaateAMMPool.js script


// USE BINANCE PRICE DATA TO SET UP THE PRICE CORRECTLY => (reserve ratios: of asset 1 and asset 2 need to be precise to make the pool price accurate: aka DONT LOSE MONEY, or set at Higher price =)
const cexSymbolPair = "BATUSDT";

const tokenA = "0xF97048222D434e7A1a83e57462a3B0aaB626313d";
const tokenB = "0x788c12145E5E15717020095172d3471Fd6C0569f";

const aToken = new ethers.Contract(tokenA, erc20ABI, account);
const bToken = new ethers.Contract(tokenB, erc20ABI, account);

let aDecimal;
let bDecimal;
/*
use  percentage of the balanceOf tokenA 
- working correctly
*/
const percentageOf = 20;// 2 == 50%, 3 = 33% ,4 = 25%, 5 = 20%
let balanceTokenA;

async function getPrice(symbolPair) {
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
    console.log("Data2: ", data);
    return data;
}
/*
Grab basic information from the token contracts
get the balance of the token A 
*/
async function getSymbol() {
    balanceTokenA = await aToken.balanceOf(account.address);
    console.log("BalanceOf: ", balanceTokenA.toString());
    balanceTokenA = balanceTokenA.div(percentageOf);// Only use a percentage of balance
    console.log("BalanceUsed: ", balanceTokenA.toString());
    let symbolA = await aToken.symbol();
    let symbolB = await bToken.symbol();
    aDecimal = await aToken.decimals();
    bDecimal = await bToken.decimals();
    let pair = symbolA + symbolB;// create the pair
    return pair;
}
/*
Create Pair on AMM 
- Only use a percentage of the tokenA balance for the LP
- calculate the amount of tokenB required to make the pool
*/
async function createPair(exchangeRate) {
    const blockNumber = await provider.getBlockNumber();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);
    console.log("Swap Expires: " + expiryDate + " | Time: " + blockData.timestamp);

    const weiAmountA = balanceTokenA;
    const normA = ethers.utils.formatUnits(weiAmountA.toString(), aDecimal)
    console.log("price:" + exchangeRate + "Normalize TokenA in: ", normA);// working

    // normA is the amount of LINK that will be used to make the pool.  Now lets figure out how much ETH will be needed
    const ratio = normA *exchangeRate;// # of LINK times the exchangeRate = how many ETH Needed
    let try_ratio = ratio.toFixed(4);
    console.log("ratio:" + ratio);
    const weiAmountB = ethers.utils.parseUnits(try_ratio.toString(4), bDecimal);
    console.log("Wei TokenB: " + weiAmountB.toString() + " Normal Amount:" + try_ratio);

    let amountAmin = weiAmountA;
    let amountBmin = weiAmountB;
    let amountAdesired = amountAmin;
    let amountBdesired = amountBmin;

    let printThis = "TokenA: " + tokenA + " TokenB: " + tokenB + "\n" +
        "Amount In " + amountAmin + " Amount In " + amountBmin + "\n" +
        "Exchange Rate " + exchangeRate;

    console.log(printThis);

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();

    //Signer 
    const nonce = await account.getTransactionCount("latest");

    console.log("TransactionCount: " + nonce);

    //approve the assets
    await doApproval(tokenA, amountAdesired);
    await doApproval(tokenB, amountBdesired);
    /*
        const objectBlock = {
            "gasPrice": try_string,
            "gasLimit": "280000",
            "nonce": nonce
        }
    */

    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    let ok = await routerContract.addLiquidity(
        tokenA,
        tokenB,
        amountAdesired,
        amountBdesired,
        amountAmin,
        amountBmin,
        account.address,
        expiryDate

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
}

async function doApproval(token, amount) {
    if (token == tokenA) {
        const weiAmount = amount;
        let allowanceAmount = await aToken.allowance(account.address, routerAddress);
        console.log("Router Contract Allowance: " + allowanceAmount.toString(), allowanceAmount);

        if (allowanceAmount.toString() == "0" || weiAmount.toString() >= allowanceAmount.toString()) {

            console.log("Router Contract Needs Increased Allowance: ");

            const increase = weiAmount.mul(2);

            const parse = await aToken.approve(routerAddress, increase);

            const receipt = await parse.wait();

            console.log("Router Contract Result: ", receipt);
        }
        console.log("Router Contract Allowance Complete");
    } else {
        const weiAmount = amount;
        let allowanceAmount = await bToken.allowance(account.address, routerAddress);
        console.log("Router Contract Allowance: " + allowanceAmount.toString(), allowanceAmount);

        if (allowanceAmount.toString() == "0" || weiAmount.toString() >= allowanceAmount.toString()) {

            console.log("Router Contract Needs Increased Allowance: ");

            const increase = weiAmount.mul(2);

            const parse = await bToken.approve(routerAddress, increase);

            const receipt = await parse.wait();

            console.log("Router Contract Result: ", receipt);
        }
        console.log("Router Contract Allowance Complete");
    }
}

async function testThis() {
    let pair = await getSymbol();
    console.log("DEFI PAIR:", pair);
    /*
    get two prices 

    let marketA = await getPrice("LINKUSDT");
    let marketB = await getPrice("BCHUSDT");
    let ratio = marketA/marketB;

    console.log("Price: LINK RUBY: " + ratio);
    await createPair(ratio);


    */
    let marketA = await getPrice(cexSymbolPair);
    

    console.log("Price:  " + marketA);
    await createPair(marketA);
}

testThis();


