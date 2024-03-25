const ethers = require('ethers');
const factoryABI = require('../../abi/factory.json');
const pairABI = require('../../abi/pair.json');
const erc20ABI = require('../../abi/erc20.json');
const routerABI = require('../../abi/amm_router.json');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const account = walletOrigin.connect(providerOrigin);

/*

AMM POOL reserves, pool_address, pool_price, checks connected wallet balance etc

*/

const address = config["aqua-dex"].router;
const routerContract = new ethers.Contract(address, routerABI, account);

async function getAllPools() {

    const factoryAddress = await routerContract.factory();
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
    // Get the number of Pools within the Factory contract
    let value = await factoryContract.allPairsLength();
    let valueS = Number(value.toString());
    console.log("Total Pools: ", value.toString());
    // Print out all the Pool Addresses
    for (let i = 0; i < valueS; i++) {
        let value3 = await factoryContract.allPairs(i);// See the Full print out 
        let pairAddress = value3.toString();
        const poolContract = new ethers.Contract(value3.toString(), pairABI, account);
        let tokenA_Address = await poolContract.token0();
        let tokenB_Address = await poolContract.token1();
        let pairReserves = await poolContract.getReserves();
        let supply = await poolContract.totalSupply();
        let balance = await poolContract.balanceOf(account.address);
        let perc = balance / supply;

        const tokenA_Contract = new ethers.Contract(tokenA_Address, erc20ABI, account);
        const tokenB_Contract = new ethers.Contract(tokenB_Address, erc20ABI, account);

        let symTokenA = await tokenA_Contract.symbol();
        let symTokenB = await tokenB_Contract.symbol();

        let decimalDigitTokenA = await tokenA_Contract.decimals();
        let decimalDigitTokenB = await tokenB_Contract.decimals();

        // FIND USDP (base currency) 
        // depending on the USDP index location, the pricing calculation can reverse

       
            const pairA = pairReserves[0];// any 
            const pairB = pairReserves[1];// any 
            const priceBetter = ethers.utils.formatUnits(pairA.toString(), decimalDigitTokenA) / ethers.utils.formatUnits(pairB.toString(), decimalDigitTokenB);
            let stringThing = "-----------------------------------------------\n" +
        
                "Pair Address: " + pairAddress + "\n" +
                "Symbol " + symTokenA + "-" + symTokenB + " Reserves[0]: " + pairA + " d: " + decimalDigitTokenA + " Reserves[1]: " + pairB + " d:" + decimalDigitTokenB + "\n" +
                "A/B: " + priceBetter
                + "\nBalanceOf: " + balance.toString() + " | Percentage of Pool ownership: " + perc + " %";

            console.log(stringThing);
    }
}

function format18(USDP_RESERVES) {
    const usdp = ethers.utils.formatUnits(USDP_RESERVES, 18)
    return usdp
}

function run() {
    getAllPools();
}
run();
