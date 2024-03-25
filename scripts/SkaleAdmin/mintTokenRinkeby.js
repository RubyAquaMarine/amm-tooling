const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const skale = require('../schain_modules/utils')
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.rinkeby);
const wallet = new ethers.Wallet(credentials.account.privateKeyAdmin2);
const accountOrigin = wallet.connect(provider);


const TOKEN_ADDR = '0xF10B6447E455f7B1B29899e81E3A25F52A3Adb59';

async function mint() {

     // set minter / burner to owner
  //  await skale.setMinterRole(TOKEN_ADDR,accountOrigin.address, accountOrigin)
  //   await skale.setBurnerRole(TOKEN_ADDR,accountOrigin.address, accountOrigin)

    await skale.mintERC20(
        '1000000',
        TOKEN_ADDR,
        accountOrigin)

 // set minter / burner to token Manager
   // await skale.setMinterRole(TOKEN_ADDR,config.skale.token_manager, accountOrigin)
   // await skale.setBurnerRole(TOKEN_ADDR,config.skale.token_manager, accountOrigin)

   
    // set minter / burner to  token_linker
  //  await skale.setMinterRole(TOKEN_ADDR,config.skale.token_linker, accountOrigin)
  //  await skale.setBurnerRole(TOKEN_ADDR,config.skale.token_linker, accountOrigin)
   
}

mint();