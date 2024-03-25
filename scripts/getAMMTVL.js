const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const pairABI = require('../abi/pair.json');
const factoryABI = require('../abi/factory.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const { formatUnits } = require('@ethersproject/units');
//----------------------------------- ADJUST
const rpcUrl = config.rpc.schainHub;
const factoryAddress = config.ammv2.factory;
//----------------------------------- ADJUST
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);


async function runTest(tokenA, tokenB) {

    let realTVL;

    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
    const pairAddress = await factoryContract.getPair(tokenA, tokenB);

    const pairContract = new ethers.Contract(pairAddress, pairABI, account);
    const pairReserves = await pairContract.getReserves();

    // get the correct base currency

    let token0Address = await pairContract.token0();
    let token1Address = await pairContract.token1();


    const fromContract = new ethers.Contract(token0Address, erc20ABI, account);
    const toContract = new ethers.Contract(token1Address, erc20ABI, account);

    const decimalDigitTokenA = await fromContract.decimals();
    const decimalDigitTokenB = await toContract.decimals();

    const symTokenA = await fromContract.symbol();
    const symTokenB = await toContract.symbol();

    // FIND USDP (base currency)

    if (symTokenA == "USDP") {
        console.log("RESERVE[0] = USDP");

        const pairA = pairReserves[0];//usd
        const pairB = pairReserves[1];//ruby
        const priceBetter = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA) / ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB);
        let stringThing = "-----------------------------------------------\n" +
            "Factory Address: " + factoryAddress + "\n" +
            "Pair Address: " + pairAddress + "\n" +
            "symbol " + symTokenA + "-" + symTokenB + " Reserves[0]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[1]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
            "symbol " + symTokenA + " Reserves[0]: " + format18(pairA) + "\n" +
            "Price: " + priceBetter;

        console.log(stringThing);
        realTVL = estTVL(pairA);
        return realTVL;
    }
    if (symTokenB == "USDP") {
        console.log("RESERVE[1] = USDP");
        const pairA = pairReserves[0];//ruby
        const pairB = pairReserves[1];//usd


        const priceBetter = ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB) / ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA);
        let stringThing = "-----------------------------------------------\n" +
            "Factory Address: " + factoryAddress + "\n" +
            "Pair Address: " + pairAddress + "\n" +
            "symbol " + symTokenA + "-" + symTokenB + " Reserves[1]: " + pairB + " d: " + decimalDigitTokenB + " Reserves[0]: " + pairA + " d:" + decimalDigitTokenA + "\n" +
            "symbol " + symTokenB + " Reserves[1]: " + format18(pairB) + "\n" +
            "Price: " + priceBetter;

        console.log(stringThing);
        realTVL = estTVL(pairB);
        return realTVL;

    }
}

// Base USDP times two equals
function estTVL(USDP_RESERVES) {
    const usdp = ethers.utils.formatUnits(USDP_RESERVES, 18)
    const usdpNumber = Number(usdp) * 2;
    console.log("TVL:", usdpNumber)
    return usdpNumber
}

function format18(USDP_RESERVES) {
    const usdp = ethers.utils.formatUnits(USDP_RESERVES, 18)
    return usdp
}


// EUROPA
async function run() {

    let total_tvl;

    total_tvl += await runTest(config.assets.europa.USDP,
        config.assets.europa.RUBY,
    );

    total_tvl += await runTest(config.assets.europa.USDP,
        config.assets.europa.ETH,
    );

    total_tvl += await runTest(config.assets.europa.USDP,
        config.assets.europa.BTC,
    );

    total_tvl += await runTest(config.assets.europa.USDP,
        config.assets.europa.SKL,
    );

    console.log("AMM TVL", total_tvl)

}
// FANCY
async function runFancy() {

    let total_tvl;

    total_tvl += await runTest(config.assets.fancy.USDP,
        config.assets.fancy.RUBY,
    );

    total_tvl += await runTest(config.assets.fancy.USDP,
        config.assets.fancy.ETH,
    );

    total_tvl += await runTest(config.assets.fancy.USDP,
        config.assets.fancy.BTC,
    );

    total_tvl += await runTest(config.assets.fancy.USDP,
        config.assets.fancy.SKL,
    );

    console.log("AMM TVL", total_tvl)

}

//run();
runFancy();
