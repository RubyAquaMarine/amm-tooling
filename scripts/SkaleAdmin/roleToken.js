const ethers = require('ethers');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
const skale = require('../../schain_modules/utils')
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.whispering_turais);
const wallet = new ethers.Wallet(credentials.account.privateKeyAdmin2);
const accountOrigin = wallet.connect(provider);


const TOKEN_ADDR = '0x6F879207FA01c89E76a415f81156372e9b37B1aF';

async function mint() {

  // set minter / burner to owner
  //  await skale.setMinterRole(TOKEN_ADDR,accountOrigin.address, accountOrigin)
  //  await skale.setBurnerRole(TOKEN_ADDR,accountOrigin.address, accountOrigin)


  // set minter / burner to token Manager
  await skale.setMinterRole(TOKEN_ADDR, config.skale.token_manager, accountOrigin)
  await skale.setBurnerRole(TOKEN_ADDR, config.skale.token_manager, accountOrigin)


  // set minter / burner to  token_linker
  //  await skale.setMinterRole(TOKEN_ADDR,config.skale.token_linker, accountOrigin)
  //  await skale.setBurnerRole(TOKEN_ADDR,config.skale.token_linker, accountOrigin)

}

mint();