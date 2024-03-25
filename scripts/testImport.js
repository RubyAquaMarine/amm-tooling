const approv = require('./doApproval.js');
const ethers = require('ethers');
const rpcUrl = "https://dappnet-api.skalenodes.com/v1/melodic-murzim";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

let fromToken = '0x58F2b35dde559F49B9870Ec101c3b1B8433C644d';
const routerAddress = '0x699D09C9B1E33518eC3715F30ac696C59a2d34c8';
let swapAmount = ethers.utils.parseUnits("1", 'ether');// works
console.log("Approval Amount: ", swapAmount.toString())

// approve the transfer
async function test(){
    let test = await approv.Approval(swapAmount, fromToken, routerAddress, account).then(res=>{
        return res;
    }).catch(err=>{
    
    })
    console.log(test)
}

test();


