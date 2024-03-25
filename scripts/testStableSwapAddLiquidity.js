const ethers = require('ethers');
const erc20ABI = require('./abi/erc20.json');
const stableSwapABI = require('./abi/stableSwap.json');
const credentials = require('./keys.json');
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

const stableSwapAddress = config.ammv2.stableSwap;// what amm deploy?
const stableSwapContract = new ethers.Contract(stableSwapAddress, stableSwapABI, account);

const USDP = "0x0EB4a542fcCBe6c985Eaa08e7A5De0f27cb50938";
const DAI = "0x059Fc87C315c659Bc11B0F7F524d20413A4A0fAC";
const USDC = "0x788c12145e5e15717020095172d3471fd6c0569f";
const USDT = "0x9dbfccd94c26cd219b60754215abcc32c26f41c2";

const addUSDValuePerToken = "100";

async function doApproval(swapAmount, symbolAddress) {

  const fromContract = new ethers.Contract(symbolAddress, erc20ABI, account);

  const weiAmount = swapAmount;

  let allowanceAmount = await fromContract.allowance(account.address, stableSwapAddress);

  console.log("Router Contract Allowance Amount: " + allowanceAmount.toString());

  if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {

    console.log("Router Contract Needs Increased Allowance: ");

    const increase = weiAmount.mul(10);

    const parse = await fromContract.approve(stableSwapAddress, increase);

    const receipt = await parse.wait();

    console.log("Router Contract Result: ", receipt);
  }
}

/*
 "inputs": [
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256",
          "name": "minToMint",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
*/

async function testStableSwap() {

  /*
  let address0 = await stableSwapContract.getToken(0);
  let address1 = await stableSwapContract.getToken(1);
  let address2 = await stableSwapContract.getToken(2);
  let address3 = await stableSwapContract.getToken(3);
  let stringAddress = " " + address0 + " | " + address1 + " | " + address2 + " | " + address3;
  console.log(stringAddress);
  */
  let address0Balance = await stableSwapContract.getTokenBalance(0);
  let address1Balance = await stableSwapContract.getTokenBalance(1);
  let address2Balance = await stableSwapContract.getTokenBalance(2);
  let address3Balance = await stableSwapContract.getTokenBalance(3);
  let stringBalance = "Pool Reserves: USDP: " + address0Balance + " | DAI: " + address1Balance + " | USDC: " + address2Balance + " | USDT: " + address3Balance;
  console.log(stringBalance);

  let paused = await stableSwapContract.paused();
  console.log("StableSwap trading stopped (true/false): " + paused);

  let price = await stableSwapContract.getVirtualPrice();
  const normPrice = ethers.utils.formatUnits(price.toString(), 18);
  console.log("Virtual Price: " + price.toString() + " | " + normPrice + "USD");

  /*
  let storage = await stableSwapContract.swapStorage();
  console.log("SwapStorage:  " + storage);

  let a = await stableSwapContract.getA();
  console.log("Amplification Factor  " + a);
  */
  

  let wei = ethers.utils.parseUnits(addUSDValuePerToken, 'ether');// works
  let weiD = ethers.utils.parseUnits(addUSDValuePerToken, 6);// works
  console.log("WEI AMOUNTS  " + wei.toString() + " --- " + weiD.toString());

  await doApproval(weiD,  USDC);
  await doApproval(weiD,  USDT);
  await doApproval(wei,  USDP);
  await doApproval(wei,  DAI);

  //Provider 
  const blockNumber = await provider.getBlockNumber();

  const blockData = await provider.getBlock(blockNumber);

  const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

  console.log("Block: " , expiryDate.toString());

  let coins = [];
  // usdp
  coins[0] = wei;
  // dai
  coins[1] = wei;
  //usdc
  coins[2] = weiD;
  //usdt
  coins[3] = weiD;

  await stableSwapContract.addLiquidity(coins, 0, expiryDate).then(result => {
    console.log("Results: ",result);

   // result.wait(1).then(ok =>{
  //    console.log("Ok: ",ok);// for debugging
  //  });
    
  }).catch(err=>{
    console.log("Catch Error: " , err);
  })

}

function run() {

  setInterval(testStableSwap, 60000);

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