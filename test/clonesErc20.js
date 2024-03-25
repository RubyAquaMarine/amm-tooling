const ethers = require('ethers');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.fancy_rasalhague); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin2);
const accountOrigin = walletOrigin.connect(providerOrigin);

const token_manager_abi = require('../abi/skale_l2_token_manager.json');

const ORIGIN_CHAIN = config.skale.whispering;
const ORIGIN_TOKEN = config.assets.whispering.BRAWL

async function doesOriginTokenExist(chainName, address) {

    const tokenManager = new ethers.Contract(config.skale.token_manager, token_manager_abi, accountOrigin);

    const chain = ethers.utils.solidityKeccak256(["string",], [chainName])

    const res = await tokenManager.clonesErc20(chain, address).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    if (res == '0x0000000000000000000000000000000000000000') {
        console.log("NEED TO MAP TOKENS")
    } else {
        console.log(`Origin token address: ${address} mapped to: ${res} from origin chain: ${chainName}`)
    }
}

/* 
    does token exist on this rpc

    - inputs: 
    - the chain where the asset originated from 
    - token contract address on the origin chain 

    output: 
        target token address
        finds the mapped token address on current rpc aka 
*/

async function run() {
    await doesOriginTokenExist(ORIGIN_CHAIN, ORIGIN_TOKEN);
}

run();

/*
skale chain admin ui 
 - allow chain list and all assets on that chain. then show what tokens have already been mmapped (target token already deployed)


- function chainInput get all the tokens from the block explorer , return and loop

*/