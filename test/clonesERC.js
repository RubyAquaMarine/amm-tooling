const ethers = require('ethers');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.whispering_turais); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin2);
const accountOrigin = walletOrigin.connect(providerOrigin);

const token_manager_abi = require('../abi/skale_l2_token_manager.json');

const ORIGIN_CHAIN = config.skale.whispering;

async function testTVL() {

    const tokenManager = new ethers.Contract(config.skale.token_manager, token_manager_abi, accountOrigin);
    /*
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
    */

   let chain = ethers.utils.solidityKeccak256([ "string", ], [ 'Mainnet' ])
   let address = '0x5e364d857dD602C980d275DdbCE3CB474bbbFb0A';


    let res = await tokenManager.clonesErc20(chain, address).then(result=>{
        return result;
    }).catch(err=>{
        console.log(err)
    })

    if(res == '0x0000000000000000000000000000000000000000'){

        console.log("MAPPING TOKENS")
    }else{

        console.log("TOKEN ALREADY MAPPED TO:", res)
    }

    console.log(res)

}

async function run() {

    await testTVL();
}

run();