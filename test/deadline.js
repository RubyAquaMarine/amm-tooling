// deadline
const ethers = require('ethers');
const amm = require('../ruby_modules/amm.js');
const rewarder = require('../ruby_modules/rewarder.js');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

console.log('wallet', accountOrigin.address)

const HUMAN_AMOUNT = '0.0000625';


async function getBlock() {

    const provider = providerOrigin;
    const blockNumber = await provider.getBlockNumber();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 86400*30);// 30 day
    console.log(expiryDate.toString())

}


function usdDividedByXYZ(_usdp,_xyz) {
    const a = ethers.utils.parseUnits(_usdp, 18).toString();// USDP
    const b = ethers.utils.parseUnits(_xyz, 18).toString();// XYZ
    // (100 usdp and / 100 ruby) = 1 ruby = usdp 
    let price = Number(a) / Number(b);
    console.log("sdDividedByXYZ ", price.toString())
    
  }


 


async function run() {
    // Input 
        // USDP 
        // XYZ
    usdDividedByXYZ('0.96', '1') ;

    const amount = ethers.utils.parseEther(HUMAN_AMOUNT,18);

    console.log(`amount ${amount}`)
   
    await getBlock();
  
}

run();

/*
 Add liquidity  / create new amm pool 


 router address : 0xd4c0828fc3c50b75ebdcee209c7423a7398c4d72

 USDP 0x73d22d8a2D1f59Bf5Bcf62cA382481a2073FAF58

 TGOLD 0x9F26f887307986CBC2BA53BFf9A8E2e5Da61D1f8


[  {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }]






*/