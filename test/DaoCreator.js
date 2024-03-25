const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const abi = require('../abi/factory.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const FactoryAddress = config.amm.factory;

const DAOAddress = config.amm.daoPairCreator;

const Router = config.amm.router;

async function PlayArena() {

    const factoryContract = new ethers.Contract(FactoryAddress, abi, accountOrigin);
    let tx = await factoryContract.pairCreators(Router);

    console.log(" Router is creator ", tx)

    tx = await factoryContract.pairCreators(DAOAddress);

    console.log("DAOPairCreator is creator ", tx)


}

async function run() {

    await PlayArena();// Play Now


}
run();