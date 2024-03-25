const axios = require('axios');
const ethers = require('ethers');
const erc20ABI = require('../../abi/erc20.json');
const routerABI = require('../../abi/amm_router.json');
const factoryABI = require('../../abi/factory.json');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const account = walletOrigin.connect(provider);


const factoryAddress = config.amm.factory;
const factory = new ethers.Contract(factoryAddress, factoryABI, account);

const ADDRESS = '0x60592CB8ceD45A2dc432CB1Fe49c2Fa1a6bfa423';



async function createPair(_address) {
  let isCreator = await factory.pairCreators(_address);
  console.log("is Creator::", isCreator, _address)
  let isAdmin = await factory.admin();
  console.log("is Admin::", isAdmin)
}



async function testThis() {
  
  await createPair(ADDRESS);

}

testThis();



