const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');

const tokenManagerABI = require('../abi/skale_l2_token_manager.json');

const config = require('../setConfig.json');
const rpcUrl = config.rpc.fancy_rasalhague;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);


// RUBY TOKEN 
const tokenAddress = "0x2d76e3e55bb9e573af26043fb0c76cbbfac95a2c"; // https://rinkeby.etherscan.io/token/0x2d76e3e55bb9e573af26043fb0c76cbbfac95a2c
const tokenAddressSchain = "0x83B38f79cFFB47CF74f7eC8a5F8D7DD69349fBf7";   


async function runTest() {

    let tokenA = tokenAddress;
    let tokenS = tokenAddressSchain;

    const tokenManagerAddress = config.skale.token_manager;
   
    const tokenManagerContract = new ethers.Contract(tokenManagerAddress, tokenManagerABI, account);// L2

    const usdpContract = new ethers.Contract(tokenS, erc20ABI, account);// L2
    let weiAmount = await usdpContract.balanceOf(account.address);

    let dec = await usdpContract.decimals();

    let humanAmount = ethers.utils.formatUnits(weiAmount, dec)

    let allowanceAmount = await usdpContract.allowance(account.address, tokenManagerAddress);
    console.log("Allowance Amount: ", allowanceAmount.toString());
    console.log("Balance Amount: ", weiAmount.toString());
    console.log("Balance Norm: ", humanAmount);

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();


    let objectBlock = {
        'gasPrice': try_string,
        'gasLimit': '455405'
    }

    if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
        console.log("Increased Allowance: ", objectBlock);
        // const multiplier = parseInt(credentials.tools.maxTrades);
        const increase = weiAmount;
        let parse = await usdpContract.approve(tokenManagerAddress, increase, objectBlock).then(result => {
            console.log(result);
        }).catch(err => {
            console.log("error on approval: ", err);
        })
        const receipt = await parse.wait();
        console.log("Allowance Result: ", receipt);
    }

    // now its time to bridge the assets
    const sendAmount = weiAmount.div(100);
    humanAmount = ethers.utils.formatUnits(sendAmount, dec)
    console.log("Send Balance: ", humanAmount);

    // Bridging
    res = await tokenManagerContract.exitToMainERC20(tokenA, sendAmount);
    await res.wait(1);

    console.log(res);
}

function run() {
    runTest();
    // count down, run function, count down again
    //   setInterval( 
    //        runTest,
    //       61000 // 6 minutes to prevent rate limiting
    //        //61000*5 // 6 minutes to prevent rate limiting
    //    );
}
run();
