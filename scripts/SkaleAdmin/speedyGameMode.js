const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const config_controller_abi = require('../abi/skale_config_controller.json');
const schain_configController = config.skale.config_controller;
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKeyAdmin);
//--------------------------------------ADJUST-----------------------------------||
const account = wallet.connect(provider);
const init_signer = account;

async function turnOnGameMode(){
    const contract = new ethers.Contract(schain_configController, config_controller_abi, init_signer);
    let res = await contract.enableMTM()
    console.log(res)
}

async function turnOffGameMode(){
    const contract = new ethers.Contract(schain_configController, config_controller_abi, init_signer);
    let res = await contract.disableMTM()
    console.log(res)
}

async function run(){

 await    turnOffGameMode();
}

run();