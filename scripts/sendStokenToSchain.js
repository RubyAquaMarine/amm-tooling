const ethers = require('ethers');
const erc20ABI = require('./abi/erc20.json');

const tokenManagerABI = require('./abi/skale_l2_token_manager.json');

const config = require('./setConfig.json');
const rpcUrl = config.rpc.schainHub;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
const privateKey = credentials.account.privateKeyAdmin;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const transferAmount = "100";

// melodic-murzim
// fancy-rasalhague
//whispering-turais
const destChainName = "whispering-turais";
// MAINNET TOKEN ADDRESS DAI 0xa57bd5805f66B4BdE50DFbf2ddAc0269CBf3301e
const tokenAddress = "0xe371aCdA51b5249d1C36DCD0055AcAb1c80C6Ed2";// the docs are implying that this parameter can be the mainnet token address and the Origin token address when bridging from the targetschain back to the origin chain
// ORIGIN TOKEN ADDRESS
const schainWalletTokenAddress = "0xe371aCdA51b5249d1C36DCD0055AcAb1c80C6Ed2";

async function runTest() {
    const tokenManagerAddress = config.skale.token_manager;
    console.log("TokenManager Contract Address:", tokenManagerAddress);

    const tokenManagerContract = new ethers.Contract(tokenManagerAddress, tokenManagerABI, account);// L2

    const usdpContract = new ethers.Contract(schainWalletTokenAddress, erc20ABI, account);// L2

    const tokenDecimal = await usdpContract.decimals();

    let weiAmount = await usdpContract.balanceOf(account.address);
    let humanAmount = ethers.utils.formatUnits(weiAmount, tokenDecimal);

    let allowanceAmount = await usdpContract.allowance(account.address, tokenManagerAddress);
    console.log("Allowance Amount: ", allowanceAmount.toString());
    console.log("Balance Amount: ", weiAmount.toString());
    console.log("Balance Norm: ", humanAmount);

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();

    let nonce;
    let objectBlock;

    if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {

        nonce = await account.getTransactionCount("latest");

        objectBlock = {
            "gasPrice": try_string,
            "gasLimit": "280000",
            "nonce": nonce
        }
        console.log("Increased Allowance: ", objectBlock);

        let parse = await usdpContract.approve(tokenManagerAddress, weiAmount, objectBlock).then(result => {
            console.log(result);
            return result;
        }).catch(err => {
            console.log("error on approval: ", err);
        })

        const receipt = await parse.wait(1);
        console.log("Allowance Result: ", receipt);
    }

    // now its time to bridge the assets
    const sendAmount = ethers.utils.parseUnits(transferAmount, tokenDecimal);
    humanAmount = ethers.utils.formatUnits(sendAmount, tokenDecimal)
    console.log("Send Balance: ", humanAmount);

    /*

    transferToSchainERC20(
            string calldata targetSchainName,
            address contractOnMainnet,
            uint256 amount
    */
    nonce = await account.getTransactionCount("latest");
    objectBlock = {
        from: account.address,
        nonce: nonce,
        gasLimit: 6500000,
        gasPrice: 100000000,
    }

    console.log("destChainName: ", "|" + destChainName + "|");
    console.log("mainnetTokenAddress: |", tokenAddress + "|");
    console.log("sendAmount: ", sendAmount.toString());

    let ok = await tokenManagerContract.transferToSchainERC20(destChainName, tokenAddress, sendAmount, objectBlock).then(result => {
        console.log("Result: ", result);
        return result;
    }).catch(err => {
        console.log("Eroor with transfer", err)
    })


    await ok.wait(1).then(result => {
        console.log("Receipt:", result);
    }).catch(err => {
        console.log("Receipt Error:", err);
    })



}

function run() {

    runTest();


    // count down, run function, count down again
    //  setInterval( 
    //     runTest,
    //      61000 // 6 minutes to prevent rate limiting
    //61000*5 // 6 minutes to prevent rate limiting
    //  );
}
run();
