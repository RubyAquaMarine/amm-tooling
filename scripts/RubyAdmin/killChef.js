const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const contract_abi = require('../abi/rubyMasterChef.json')
const erc20_abi = require('../abi/SkaleERC20.json')
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);
//masterchef
const MSAddress = config.amm.masterchef;
// Send to MS address would be best
const sendToSafeAddress = credentials.public.privateKey;

/* emergencyWithdrawRubyTokens(address _receiver, uint256 _amount) external onlyOwner {
 
*/
async function emergencyWithdraw() {
    console.log("MasterChef Contract Address", MSAddress)
    const contract = new ethers.Contract(MSAddress, contract_abi, accountOrigin);
    // get ruby amount within the contract
    let address = config.assets["fancy-rasalhague"].RUBY;
    console.log("Ruby Contract Address", address)
    console.log("Send to Address ", sendToSafeAddress)
    const rubyContract = new ethers.Contract(address, erc20_abi, accountOrigin);
    let amount = await rubyContract.balanceOf(MSAddress)
    console.log("Amount to send ", amount.toString())
    const call = await contract.emergencyWithdrawRubyTokens(sendToSafeAddress, amount).then(result => {
        console.log("Adjusted Token Rewards to X per Second ", result)
        return result.wait(1)
    }).catch(err => {
        console.log("Adjusted Token Rewards Error:  ", err)
    })
    console.log(" result ", call)
}

async function run() {
    emergencyWithdraw()
}

run()

