const ethers = require('ethers');
const skale = require('../schain_modules/utils.js');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);


/* gen eth address 
var ethers = require('ethers');  
var crypto = require('crypto');

var id = crypto.randomBytes(32).toString('hex');
var privateKey = "0x"+id;
console.log("SAVE BUT DO NOT SHARE THIS:", privateKey);

var wallet = new ethers.Wallet(privateKey);
console.log("Address: " + wallet.address);

*/



async function testTVL() {

  // const res = await skale.isSkaleChainConnected('honorable-steel-rasalhague', config.skale.token_linker, accountOrigin)

  //  console.log(res)


  const metadata = await skale.isRegistarRole(config.skale.token_linker, accountOrigin);

  console.log(typeof metadata, metadata, metadata.length)


  // A bytes32 hex string should have 2+64=66 char length.
  // pads 00s from left until the hex string is bytes32
  //const padded = ethers.utils.hexZeroPad(shortHexString, 32)



  //If the bytes32 is a valid utf8 byte string
  //Function bytes32ToString turns a bytes32 to hex string
  /*
  const mod_ = ethers.utils.parseBytes32String(metadata).then(res => {
    return res;
  }).catch(err => {
    console.log(err)
  })
  */


/*

  0xedcc084d3dcd65a1f7f23c65c46722faca6953d28e43150a467cf43e5c309238
  0x3b6fec9d902471f5c49991ceb268ac8961473053867b04c747dd90001120fa26 - transaction Hash
  0xD2aAA00800000000000000000000000000000000 -- address


*/

/*
Ethereum addresses are 20 bytes, so you convert hex address to bytes and then pad it to 32 bytes from left.

web3.utils.padLeft(web3.utils.hexToBytes(yourAddressString), 32);




If the bytes argument is of length 20, that is, the length of an address, this assembly one-liner works for me:


//solidity
function bytesToAddress(bytes bys) private pure returns (address addr) {
    assembly {
      addr := mload(add(bys,20))
    } 
}


*/

// GOAL 

  // First convert the bytes32 to a uint256, later to uint160(20 bytes) and finaly to addres,

  const mod_ =   ethers.utils.formatBytes32String("ETH")

  console.log(mod_)

 // const mod__ = ethers.utils.toUtf8Bytes(metadata)

//  console.log(mod__)

 

}

async function run() {

  await testTVL();
}

run();