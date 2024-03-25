const ethers = require('ethers');
const abi = require('../abi/weth.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const accountOrigin = walletOrigin.connect(providerOrigin);

// Token Address being Wrapped
const contractETH = config.assets.europa.AQUA;
const contract = '0x94C9c65c9f828703A716642E316CcE302Cdd1661';


async function tokenApprove() {
    const amount = ethers.utils.parseUnits("100000000", 18);
   
    // Token Input
    const ETH = new ethers.Contract(contractETH, abi, accountOrigin);

    // approval of the WRAPPER SC address
    let approval = await ETH.approve(contract, amount).then(result => {

        return result;

    }).catch(err => {

        console.log(err)

    })

    await approval.wait(1);

    console.log(" Data approval ", approval)
   

}

async function run() {
    await tokenApprove();
}

run();