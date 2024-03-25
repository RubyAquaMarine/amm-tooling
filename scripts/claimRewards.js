const ethers = require('ethers');
const chefABI = require('../abi/rubyMasterChef.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const approv = require('./doApproval.js');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

const chefAddress = config.ammv2.masterchef;
const chefContract = new ethers.Contract(chefAddress, chefABI, account);


// approve the transfer
async function approveTransfer(swapAmount, fromToken, destAddress) {
    let test = await approv.Approval(swapAmount, fromToken, destAddress, account).then(res => {
      return res;
    }).catch(err => {
  
    })
    console.log(test)
  }

async function depositToPool(amount, pool_id) {
    console.log("BEGIN TO DEPOSIT ")
    const send_amount = ethers.utils.parseUnits(amount, 'ether');
    let value3 = await chefContract.poolInfo(pool_id);
    let LPtoken = value3.lpToken;
    await approveTransfer(send_amount, LPtoken, chefAddress)
    let value6 = await chefContract.deposit(pool_id, send_amount).then(result => {    //  updatePool(_pid); is triggered within the deposit Function
        return result.wait(1)
    }).catch(err => {
        console.log("depositToPool:", err)
    })
}

async function claimRewards() {
    let pool_length = await chefContract.poolLength()
    for (let i = 0; i < pool_length; i++) {
        await depositToPool('0', i);
    }
}

async function run() {


    await claimRewards();

}

run();