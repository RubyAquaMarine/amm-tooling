const ethers = require('ethers');
const schain = require('../../schain_modules/utils.js');
const token_linker_abi = require('../../abi/skale_token_linker.json');
const config = require('../../setConfig.json');
const credentials = require('../../keys.json');
//--------------------------------------ADJUST-----------------------------------||
//const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN STAGING //
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

// Owner of EUROPA, 
// What chains has admin connected to?

async function test() {

  console.log('RPC:', providerOrigin.connection, 'User:', accountOrigin.address)

  // EUROPA MAINNET

  //  await schain.isSkaleChainConnected(config.skale_chains.calypsoHub, config.skale.token_linker, accountOrigin)

  //  await schain.isSkaleChainConnected(config.skale_chains.brawlChain, config.skale.token_linker, accountOrigin)

  //  await schain.isSkaleChainConnected(config.skale_chains.cryptoBlades, config.skale.token_linker, accountOrigin)

  //  await schain.isSkaleChainConnected(config.skale_chains.razor, config.skale.token_linker, accountOrigin)

  //  await schain.isSkaleChainConnected(config.skale_chains.nebula, config.skale.token_linker, accountOrigin)

  //  await schain.isSkaleChainConnected(config.skale_chains.cryptoC, config.skale.token_linker, accountOrigin)

  // await schain.isSkaleChainConnected('wan-red-ain', config.skale.token_linker, accountOrigin)

  // await schain.isSkaleChainConnected('adorable-quaint-bellatrix', config.skale.token_linker, accountOrigin)// LIVE CGI

  // EUROPA STAGING

  /*
  await schain.isSkaleChainConnected(config.skale_chains.staging.calypso, config.skale.token_linker, accountOrigin)
  await schain.isSkaleChainConnectedV2(config.skale_chains.staging.calypso, config.skale.message_proxy_chain_address, accountOrigin)
  await schain.isSkaleChainConnected('staging-faint-slimy-achird', config.skale.token_linker, accountOrigin)
  await schain.isSkaleChainConnected('staging-weepy-fitting-caph', config.skale.token_linker, accountOrigin)
  await schain.isSkaleChainConnected('staging-fast-active-bellatrix', config.skale.token_linker, accountOrigin)
  */

  const connected = await schain.isSkaleChainConnected('staging-untimely-yawning-algorab', config.skale.token_linker, accountOrigin)

  return connected;

}

async function connectSchain(schain_name_dest) {
  const tokenManagerLinkerContract = new ethers.Contract(config.skale.token_linker, token_linker_abi, accountOrigin);
  let tx = await tokenManagerLinkerContract.connectSchain(schain_name_dest).then(result => {
    console.log("result", result);
    return result;
  }).catch(err => {
    console.log("err", err);
  })

  if (tx) {
    const rec = await tx.wait(1).then(result => {
      console.log("result", result);
      return result;
    }).catch(err => {
      console.log("err", err);
    })

    console.log("receipt", rec);
  }


  let isConnected = await tokenManagerLinkerContract.hasSchain(schain_name_dest);
  console.log("is connected sChain", isConnected);
}

async function run() {

  const isCon = await test();

  if (!isCon) {
    await connectSchain('staging-untimely-yawning-algorab')
  }






}

run();