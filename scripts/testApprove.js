const approv = require('./doApproval.js');
const ethers = require('ethers');
const config = require('../setConfig.json');
//-----------------------ADJUST---||
const rpcUrl = config.rpc.l1;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
//-------------------------------------ADJUST-----||
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

let fromToken = config.assets.mainnet.USDT;
const routerAddress = config.skale.deposit_box;// EUROPA 
let swapAmount = ethers.utils.parseUnits("300", 6);// works
console.log("Approval Amount: ", swapAmount.toString())

// approve the transfer
async function test() {
    let test = await approv.Approval(swapAmount, fromToken, routerAddress, account).then(res => {
        console.log("DEBUG ", res)
        return res;
    }).catch(err => {
        console.log(err)
    })
    console.log(test)
}

test();


