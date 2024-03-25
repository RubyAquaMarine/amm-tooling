const ethers = require('ethers');
const abi = require('../abi/weth.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

// Token Address being Wrapped
const contractETH = config.assets.europa.ETH;
const contractWrapperAddress = config.assets.europa.wrap.wETH;
const amount = ethers.utils.parseEther('0.0000000000000001');

async function testWrapper() {

    const WETH = new ethers.Contract(contractWrapperAddress, abi, accountOrigin);

    let test = await WETH.decimals();

    console.log(" Data ", test)

    let test1 = await WETH.name();

    console.log(" Data ", test1)

    let test2 = await WETH.symbol();

    console.log(" Data ", test2)

    let test3 = await WETH.balanceOf(accountOrigin.address);

    console.log(" Balance Of ", test3.toString())

    const ETH = new ethers.Contract(contractETH, abi, accountOrigin);

    // approvale the WETH SC address
    let approval = await ETH.approve(contractWrapperAddress, amount).then(result => {

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

        console.log(err)

    })

    console.log(test4);


    let test5 = await WETH.balanceOf(accountOrigin.address);

    console.log(" New Balance ", test5.toString())




    // withdrawal
    /*

    let wd = await WETH.withdrawTo(accountOrigin.address, amount).then(result => {

        return result;

    }).catch(err => {

        console.log(err)

    })


    wd.wait(1).then(result => {
        return result;
    }).catch(err => {

        console.log(err)

    })

    console.log(wd);
    */


}

async function run() {

    await testWrapper();
}

run();