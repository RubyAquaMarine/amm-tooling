const ethers = require('ethers');
const erc20ABI = require('../../abi/erc20.json');
const config = require('../../setConfig.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa);
const credentials = require('../../keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);
const approv = require('../doApproval.js');


const toAddress = "0x1D63d838B871031BA5A9057cD1E7359F6b3Fa25c";// Your Public Address
const sendAmount = '0.0001';

const sendSFUEL = '0.0001';

async function sendFUEL() {
    const send_amount = ethers.utils.parseUnits(sendSFUEL, 'ether');

    console.log("Sending Amount: ", send_amount.toString());

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();

    console.log("Gas Price: ", try_string);

    //Signer 
    let nonceTx = await account.getTransactionCount("latest");

    console.log("Nonce: ", nonceTx);

    //--- TO SEND ETH aka sFUEL

    const tx = {
        from: wallet.address,
        to: toAddress,
        value: send_amount,
        nonce: nonceTx,
        gasLimit: ethers.utils.hexlify(100000),
        gasPrice: gas_try
    }

    let res = await account.sendTransaction(tx).then((transaction) => {
        console.log("Transfer Complete:", transaction)
        return transaction;
    }).catch(err => {
        console.log("Error with transfer:", err)
        return err;
    })

    // await res.wait(1);

}

// Working
async function sendERC20(tokenAddress) {
    const usdpContract = new ethers.Contract(tokenAddress, erc20ABI, account);
    let weiAmount = await usdpContract.balanceOf(account.address);
    let decimalDigit = await usdpContract.decimals();
    let humanAmount = ethers.utils.formatUnits(weiAmount, decimalDigit)
    console.log("Token Balance Amount", humanAmount);
    const send_amount = ethers.utils.parseUnits(sendAmount, decimalDigit);

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();

    //Signer 
    let nonceTx = await account.getTransactionCount("latest");
    console.log("Nonce: ", nonceTx);

    //--- TO SEND ERC20
    const txERC20 = {
        nonce: nonceTx,
        gasLimit: '455405',
        gasPrice: try_string
    }

    usdpContract.transfer(toAddress, send_amount, txERC20).then(transaction => {
        console.log("tx: ", transaction)
    }).catch(err => {
        console.log("error:", err)
    })
}

async function run() {
    await  sendFUEL();
  //  await sendERC20('0x49aE5B287AF1c729FdaEcd2BEe471160f3EF273E');// skill
  //  await sendERC20("0x9B17c373CD0D8B69a123b880d69bBc44a15Eb232");// brawl
  //  await sendERC20(config.assets.fancy.USDP);
 //   await sendERC20(config.assets.fancy.USDT);
 //   await sendERC20(config.assets.fancy.DAI);
 //   await sendERC20(config.assets.fancy.RUBY);
  //  await sendERC20(config.assets.fancy.USDC);
  //  await sendERC20(config.assets.fancy.BTC);
}
run();
