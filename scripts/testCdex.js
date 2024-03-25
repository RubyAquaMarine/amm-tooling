const ethers = require('ethers');
const factoryABI = require('./abi/factory.json');
const pairABI = require('./abi/pair.json');
const erc20ABI = require('./abi/erc20.json');
const routerABI = require('./abi/amm_router.json');

const rpcUrl = "https://mainnet-api.skalenodes.com/v1/fit-betelgeuse";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');

const privateKey = credentials.account.privateKey;

const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);
const address = "0xB88AF58B511Cb378673A8709E42dA0bF013162fa";
const routerContract = new ethers.Contract(address, routerABI, account);




async function getAllPools() {

        const tokenA_Contract = new ethers.Contract("0x97F5E64c9e46d5F28AeD64C5B42cF8f7CCEEF317", erc20ABI, account);
       
        let tokenA_Symbol = await tokenA_Contract.symbol();
       
        
        //decimal
        let d = await tokenA_Contract.decimals();

        let s = await tokenA_Contract.totalSupply();

       let n =  ethers.utils.formatUnits(s, 'ether');
     

       console.log(tokenA_Symbol  + " Supply: " + s.toString() + " Normalized: " + n.toString())
    
}

function run() {
    getAllPools();
}
run();
