const ethers = require('ethers');
const boxABI = require('../abi/skale_l2_token_manager.json')
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKeyAdmin);
const account = wallet.connect(provider);
// rinkeby 0xb3bf0c62f0924e5C8fdae9815355eA98Fba33C8E
async function doNow(){

   
        const contractV2 = new ethers.Contract(config.amm.tokenManager, boxABI , account);

  

         res = await contractV2.depositBox().then(result =>{
            console.log(" is this result: ", result)
        }).catch(err=>{
            console.log(" is this err: ", err)
        })

        console.log(" is this res: ", res)

}

async function run(){
    await doNow()
}

run();
