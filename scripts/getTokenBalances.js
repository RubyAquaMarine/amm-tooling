const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const config = require('../setConfig.json');
const rpcUrl = config.rpc.schainHub;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const tokenAddress = config.assets.fancy.RUBY;

async function returnBalanceOf(addressToCheck) {
    const usdpContract = new ethers.Contract(tokenAddress, erc20ABI, account);
    let weiAmount = await usdpContract.balanceOf(addressToCheck);
    let humanAmount = ethers.utils.formatUnits(weiAmount, 18)
    console.log("Token Amount", humanAmount);
}


async function run() {
   await returnBalanceOf(account.address)
   await returnBalanceOf(config.amm.masterchef)
   await returnBalanceOf(config.amm.stake)
}
run();
