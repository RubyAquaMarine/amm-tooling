const ethers = require('ethers');
const abi = require('../abi/weth.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

// Token Address being Wrapped
const contractETH = config.assets.staging_europa.USDP;

//wrapper address
const contract = '0x02c11460D68851CaD258E8C6f4b9ebAdC8070022';

const amount = ethers.utils.parseUnits("1000000000", 18);

async function testWrapper() {
   
    // Token Input
    const ETH = new ethers.Contract(contractETH, abi, accountOrigin);

    // approval of the WRAPPER SC address
    let approval = await ETH.approve(contract, amount).then(result => {

        return result;

    }).catch(err => {

        console.log(err)

    })

    console.log(" Data approval ", approval)


}

async function run() {
    await testWrapper();
}

run();