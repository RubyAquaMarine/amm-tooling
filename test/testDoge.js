const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const pairABI = require('../abi/pair.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.doge); // dogechain
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


const LP_TOKEN = '0xa8E4040B7085A937b278e7aa95C36e9044CC6D9c';

async function calcDaily(addr) {
    console.log("LP address: ", addr)
    let res = await getPriceAMM(addr)
    return res;
}

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

async function run() {

    console.log(await calcDaily(LP_TOKEN));


}

run();
