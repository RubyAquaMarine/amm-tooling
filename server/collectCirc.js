
const ethers = require('ethers');
const token = require('../ruby_modules/blockExplorer.js');
const CRED = require('../keys.json');
const CONSTANTS = require('../Constants.json');
const FILE_DEST_HOLDERS = "server/data/holders.json";
const FILE_DEST_CIRC_SUPPLY = "server/data/supply.json";

const providerOrigin = new ethers.providers.JsonRpcProvider(CONSTANTS.project.rpc);
const walletOrigin = new ethers.Wallet(CRED.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

let RUBY_ADDRESS;
let USDP_ADDRESS;
function getCorrectSymbolMapping() {
    if (CONSTANTS.data[0].token0symbol == 'USDP') {
        USDP_ADDRESS = CONSTANTS.data[0].token0address;
        RUBY_ADDRESS = CONSTANTS.data[0].token1address;
    } else {
        USDP_ADDRESS = CONSTANTS.data[0].token1address;
        RUBY_ADDRESS = CONSTANTS.data[0].token0address;
    }
}

function getBlockExplorerMapping() {
    if (CONSTANTS.project.subgraph === 'https://ruby-dev-thegraph.ruby.exchange/subgraphs/name/ruby/exchange2') {   // aqua
        return 'http://fancy-rasalhague.testnet-explorer.skalenodes.com/api'
    } else {
        return 'https://elated-tan-skat.explorer.mainnet.skalenodes.com/api';
    }
}

async function test() {

    await token.createTokenHoldersDB(
        FILE_DEST_HOLDERS,
        URL,
        RUBY_ADDRESS
    ).then(res => {
        return res;
    }).catch(err => {
        console.log("Error createTokenHoldersDB: ", err);
    })

    await token.sortTokenHolders(RUBY_ADDRESS, FILE_DEST_CIRC_SUPPLY, FILE_DEST_HOLDERS,accountOrigin).then(res => {
        return res;
    }).catch(err => {
        console.log("Error csortTokenHolders: ", err);
    })
}

let URL;
async function run() {

    //once
    getCorrectSymbolMapping();
    URL = getBlockExplorerMapping();

    console.log('URL: ', URL)

    //debug
    //  await test();

   // setInterval(test, 1000 * 60)// 1 min
    setInterval(test, 10000 * 60)// 10 min
}

run();