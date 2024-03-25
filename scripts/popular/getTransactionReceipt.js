
const ethers = require('ethers');
const config = require('../../setConfig.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const credentials = require('../../keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const hash = "0x0e0cd5d3044b05fe44909ad51bac6a7ceeb2b7a76357ae0b900d68bda3a2b854";

async function getTx(){

    let test = await  provider.getTransactionReceipt(hash);

    console.log(test.logs[0].address);

}

getTx();