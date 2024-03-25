const ethers = require('ethers');
const walletsABI = require('../abi/skale_wallets.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.l1);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

// SKALE WALLETS for the SCHAIN OWNERS 

// WALLET that holds schainOwners ETH on L1

const address = "0xbAec960713a6c41d391C93AE42128d72C916965f";

async function checkSchainOwnerWallet() {

    const contract = new ethers.Contract(address, walletsABI, account);
    /*
    {
        "type": "function",
        "name": "getSchainBalance",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "schainHash"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": ""
            }
        ]
    },
    Schain hash: 0x0000079f99296b6e03a329124ad64458c087f20ba42432947c79ce9defdcaa1f (elated-tan-skat)
    */

    let res = await contract.contractManager()
    console.log("ContractManager", res)
    let res1 = await contract.getSchainBalance('0x0000079f99296b6e03a329124ad64458c087f20ba42432947c79ce9defdcaa1f')
    let norm = ethers.utils.formatUnits(res1,18)
    console.log(norm)

}

async function run() {

  await  checkSchainOwnerWallet();

}

run();