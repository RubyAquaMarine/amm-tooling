
const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const routerABI = require('../abi/amm_router.json');
const factoryABI = require('../abi/factory.json');
const pairABI = require('../abi/pair.json');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);
//--------------------------------------ADJUST-----------------------------------||
//const routerAddress = "0x7cC8CE65D5F3d7D417188fED0dBFE403FD956487";// NEWEST deploy
const routerAddress = config.amm.router;// NEWEST deploy

const swapAmount = '1';

// switch B/A when searching for the pool on stables
const tokenB = config.assets.fancy.ME18;
const tokenA= config.assets.fancy.USDP;
const aToken = new ethers.Contract(tokenA, erc20ABI, account);
const bToken = new ethers.Contract(tokenB, erc20ABI, account);

let aDecimal;
let bDecimal;
let pairContract;

const percentageOf = 20;// 2 == 50%, 3 = 33% ,4 = 25%, 5 = 20%
/*
Grab basic information from the token contracts
get the balance of the token A and only use a percentage of the balance for the LP
*/
async function getSymbol() {
    let symbolA = await aToken.symbol();
    let symbolB = await bToken.symbol();
    aDecimal = await aToken.decimals();
    bDecimal = await bToken.decimals();
    let pair = symbolA + symbolB;// create the pair
    return pair;
}

async function removeLP(exchangeRate) {

    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    //get the pair address 
    const factoryAddress = await routerContract.factory();
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
    const pairAddress = await factoryContract.getPair(tokenA,tokenB);
   
    // CREATE PAIR CONTACT
     pairContract = new ethers.Contract(pairAddress, pairABI, account);

    const pairBalance = await pairContract.balanceOf(account.address);


    const removeBalance = pairBalance.div(percentageOf);

    console.log("Pair Address: ", pairAddress);
    console.log("Pair Balance: ", pairBalance.toString());

    await doApproval(pairBalance) ;

    const blockNumber = await provider.getBlockNumber();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);


    //wtf
    let value = ethers.BigNumber.from(1);


    console.log("Swap Expires: " + expiryDate + " | Time: " + blockData.timestamp + " Amount Out Min: " + value.toString() + " Amount In: " + pairBalance.toString());
    
    let amountAmin = value;
    let amountBmin = value;
    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    const nonce = await account.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce);

    
    let ok = await routerContract.removeLiquidity(
        tokenA,
        tokenB,
        pairBalance,
        amountAmin,
        amountBmin,
        account.address,
        expiryDate
    ).then(result => {
        console.log("Processing Result: ", result);
        // result is another promise =. deal with it 
        let out = result.wait(1).then(ok => {
            console.log("Result 1: ", ok);
        }).catch(err => {
            console.log("Result 1 Error: ", err);
            // transaction wait is another promise =. deal with it 
             err.transaction.wait(1).then( more_erro => {
                console.log("Result 2: ", more_erro);
            }).catch(more_err => {
                console.log("Result 2 Error: ",more_err)
            })
 
        });
    }).catch(err => {
        console.log("Processing Error: ", err);
    });
}

async function doApproval(amount) {
        const weiAmount = amount;
        let allowanceAmount = await pairContract.allowance(account.address, routerAddress);
        console.log("Router Contract Allowance: " + allowanceAmount.toString());
        if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
            console.log("Router Contract Needs Increased Allowance: ");
            const parse = await pairContract.approve(routerAddress, weiAmount);
            const receipt = await parse.wait();
            console.log("Router Contract Result: ", receipt);
        }
        console.log("Router Contract Allowance Complete");
}

async function testThis() {
    let pair = await getSymbol();
    console.log("DEFI PAIR:", pair);
    await removeLP(pair);
}

testThis();
