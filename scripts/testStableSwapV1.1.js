const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const stableSwapABI = require('../abi/stableSwap.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainEuropa);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

const stableSwapAddress = config.amm.fourPool;
const stableSwapContract = new ethers.Contract(stableSwapAddress, stableSwapABI, account);

/*
currently testing the slipapge when swaping token A to B
*/

async function testStableSwap() {

    
    let address0 = await stableSwapContract.getToken(0);
    let address1 = await stableSwapContract.getToken(1);
    let address2 = await stableSwapContract.getToken(2);
    let address3 = await stableSwapContract.getToken(3);
    let stringAddress = " " + address0 + " | " + address1 + " | " + address2 + " | " + address3;
    console.log(stringAddress);
/*
    let address0Balance = await stableSwapContract.getTokenBalance(0);
    let address1Balance = await stableSwapContract.getTokenBalance(1);
    let address2Balance = await stableSwapContract.getTokenBalance(2);
    let address3Balance = await stableSwapContract.getTokenBalance(3);
    let stringBalance = " " + address0Balance + " | " + address1Balance + " | " + address2Balance + " | " + address3Balance;
    console.log(stringBalance);

    let paused = await stableSwapContract.paused();
    console.log("StableSwap trading stopped (true/false): " + paused);

    let price = await stableSwapContract.getVirtualPrice();
    const normPrice = ethers.utils.formatUnits(price.toString(), 18);
    console.log(price.toString() + " | " + normPrice + "USD");

    let storage = await stableSwapContract.swapStorage();
    console.log("SwapStorage:  " + storage);

    let a = await stableSwapContract.getA();
    console.log("Amplification Factor  " + a);

    */


   // 1 million in 4 pools

    let wei = ethers.utils.parseUnits("1", 'ether');// works
    // let wei = ethers.BigNumber.from("100000000000000000000000");// works

    let outPut = await stableSwapContract.calculateSwap(0, 1, wei);

    let bigA = ethers.BigNumber.from(wei);
    let bigB = ethers.BigNumber.from(outPut);
    let calcA = bigA.mul(1);
    let calcB = bigB.mul(1);
    let calcC = calcA.sub(calcB);
    let calcD = calcC.mul(100000);
    let calcE = calcD.div(calcA);

    let usdLoss = ethers.utils.formatUnits(calcC.toString(), 18);// works
    let perc = ethers.utils.formatUnits(calcE.toString(), 3);// works


    console.log("input " + wei + " output:  " + outPut  + " slippage: " + calcC.toString() + " | Percentage: " + perc + "% |  usd loss:" + usdLoss);

    let swapWei = ethers.utils.parseUnits("1", 'ether');// works

    /*
    await doApproval(address0,swapWei) ;
    await doApproval(address1,swapWei) ;


    //Provider 
    const blockNumber = await provider.getBlockNumber();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);
    let swapOut = await stableSwapContract.swap(0,1,swapWei,1,expiryDate).then(result =>{
      console.log("Result:" , result);
    }).catch(err=>{
      console.log("Error:" , err);
    })

    */
    
}

async function doApproval(tokenAddress,amount) {

  const weiAmount = amount;

  const fromContract = new ethers.Contract(tokenAddress, erc20ABI, account);

  let allowanceAmount = await fromContract.allowance(account.address, stableSwapAddress);

  console.log("Router Contract Allowance: " + allowanceAmount.toString());

  if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount) ) {

      console.log("Router Contract Needs Increased Allowance: ");

      const increase = weiAmount.mul(10);

      const parse = await fromContract.approve(stableSwapAddress, increase);

      const receipt = await parse.wait();

      console.log("Router Contract Result: ", receipt);
  }
}

function run() {
    testStableSwap();
}
run();

//Read
// getToken(index), returns the TokenAddress
// getTokenBalance(index) returns the token balance
// getTokenIndex ( tokenAddress) returns the index number for that TokenAddress
// getVirtualPrice() 
// paused() , check to see if the stable swap is active . returns bool
// swapStorage(), returns tons of information

// calculateRemoveLiquidity()
//calculateRemoveLiquidityOneToken()


//Write
// swap()
/*
 "inputs": [
        {
          "internalType": "uint8",
          "name": "tokenIndexFrom",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "tokenIndexTo",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "dx",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minDy",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }




 calculateSwap(
        uint8 tokenIndexFrom,
        uint8 tokenIndexTo,
        uint256 dx
*/