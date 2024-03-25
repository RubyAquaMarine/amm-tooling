const ethers = require('ethers');
const abi = require('../abi/weth.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);


// Token Address being Wrapped
const contractETH = config.assets.staging_europa.USDC;
const contract = config.assets.staging_europa.wrap.wUSDC;
const amount = ethers.utils.parseUnits('1000000', 6);

async function testWrapper() {
    const WETH = new ethers.Contract(contract, abi, accountOrigin);

    let test = await WETH.decimals();
    console.log(" Decimals ", test)

    let test1 = await WETH.name();
    console.log(" Wrapper contract Name: ", test1)

    let test2 = await WETH.symbol();
    console.log(" Data ", test2)

    let test3 = await WETH.balanceOf(accountOrigin.address);
    console.log(" Data ", test3.toString())

    // Token Input
    const ETH = new ethers.Contract(contractETH, abi, accountOrigin);

    // approval of the WRAPPER SC address
    let approval = await ETH.approve(contract, amount).then(result => {

        return result;

    }).catch(err => {

        console.log(err)

    })

    console.log(" Data approval ", approval.toString())

   
    let test4 = await WETH.depositFor(accountOrigin.address, amount).then(result => {

        return result;

    }).catch(err => {

        console.log(err)

    })

    test4.wait(1).then(result => {
        return result;
    }).catch(err => {
        console.log(err);
    })

    console.log(test4);

    let test5 = await WETH.balanceOf(accountOrigin.address);
    console.log(" New Balance ", test5.toString())

/*

    let wd = await WETH.withdrawTo(accountOrigin.address, amount).then(result => {

        return result;

    }).catch(err => {

        console.log(err)

    })


    wd.wait(1).then(result => {
        return result;
    }).catch(err => {
        console.log(err);
    })

    console.log(wd);

*/

}

async function run() {
    await testWrapper();
}

run();